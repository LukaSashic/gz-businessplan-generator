#!/bin/bash
#
# Ralph - Autonomous Development Loop
# Based on Ryan Carson's methodology
#
# Usage: ./ralph.sh [max_iterations]
# Example: ./ralph.sh 25
#
# Ralph executes user stories from prd.json autonomously,
# checking dependencies, committing after each successful story,
# and updating AGENTS.md with learnings.
#

set -e

# Configuration
MAX_ITERATIONS=${1:-10}
RALPH_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$RALPH_DIR/../.." && pwd)"
PRD_FILE="$RALPH_DIR/prd.json"
PROGRESS_FILE="$RALPH_DIR/progress.txt"
PROMPT_FILE="$RALPH_DIR/prompt.md"
LOG_FILE="$RALPH_DIR/ralph.log"
MAX_ATTEMPTS_PER_STORY=3

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Logging function
log() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${BLUE}[$timestamp]${NC} $1"
    echo "[$timestamp] $1" >> "$LOG_FILE"
}

log_success() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${GREEN}[$timestamp] ✓${NC} $1"
    echo "[$timestamp] ✓ $1" >> "$LOG_FILE"
}

log_error() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${RED}[$timestamp] ✗${NC} $1"
    echo "[$timestamp] ✗ $1" >> "$LOG_FILE"
}

log_warning() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${YELLOW}[$timestamp] ⚠${NC} $1"
    echo "[$timestamp] ⚠ $1" >> "$LOG_FILE"
}

log_info() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${CYAN}[$timestamp] ℹ${NC} $1"
    echo "[$timestamp] ℹ $1" >> "$LOG_FILE"
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."

    if ! command -v claude &> /dev/null; then
        log_error "Claude CLI not found. Install with: npm install -g @anthropic-ai/claude-code"
        exit 1
    fi

    if ! command -v jq &> /dev/null; then
        log_error "jq not found. Install with: brew install jq (Mac) or apt install jq (Linux)"
        exit 1
    fi

    if [ ! -f "$PRD_FILE" ]; then
        log_error "PRD file not found: $PRD_FILE"
        log "Create prd.json with your user stories first."
        exit 1
    fi

    if [ ! -f "$PROMPT_FILE" ]; then
        log_error "Prompt file not found: $PROMPT_FILE"
        exit 1
    fi

    # Validate JSON
    if ! jq empty "$PRD_FILE" 2>/dev/null; then
        log_error "Invalid JSON in $PRD_FILE"
        exit 1
    fi

    log_success "Prerequisites check passed"
}

# Check if all dependencies for a story are satisfied
check_dependencies() {
    local story_id=$1
    local deps=$(jq -r ".userStories[] | select(.id == \"$story_id\") | .dependencies[]?" "$PRD_FILE")

    if [ -z "$deps" ]; then
        # No dependencies
        return 0
    fi

    for dep in $deps; do
        local dep_passes=$(jq -r ".userStories[] | select(.id == \"$dep\") | .passes" "$PRD_FILE")
        if [ "$dep_passes" != "true" ]; then
            return 1
        fi
    done

    return 0
}

# Get next eligible story (passes: false AND dependencies satisfied)
get_next_story() {
    local stories=$(jq -r '.userStories[] | select(.passes == false) | .id' "$PRD_FILE")

    for story_id in $stories; do
        if check_dependencies "$story_id"; then
            echo "$story_id"
            return 0
        fi
    done

    echo ""
}

# Get story details
get_story_details() {
    local story_id=$1
    jq -r ".userStories[] | select(.id == \"$story_id\")" "$PRD_FILE"
}

# Update story passes status in prd.json
update_story_passes() {
    local story_id=$1
    local passes=$2  # true or false
    local timestamp=$(date -u '+%Y-%m-%dT%H:%M:%SZ')

    if [ "$passes" = "true" ]; then
        # Update passes and completedAt
        jq "(.userStories[] | select(.id == \"$story_id\")) |= . + {passes: true, completedAt: \"$timestamp\"}" "$PRD_FILE" > "$PRD_FILE.tmp"
    else
        jq "(.userStories[] | select(.id == \"$story_id\")).passes = false" "$PRD_FILE" > "$PRD_FILE.tmp"
    fi
    mv "$PRD_FILE.tmp" "$PRD_FILE"
}

# Update metadata in prd.json
update_metadata() {
    local completed=$(jq '[.userStories[] | select(.passes == true)] | length' "$PRD_FILE")
    local total=$(jq '.userStories | length' "$PRD_FILE")

    jq ".metadata.completedStories = $completed | .metadata.totalStories = $total" "$PRD_FILE" > "$PRD_FILE.tmp"
    mv "$PRD_FILE.tmp" "$PRD_FILE"
}

# Append to progress.txt with structured format
append_progress() {
    local story_id=$1
    local action=$2
    local details=$3
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')

    cat >> "$PROGRESS_FILE" << EOF

=== $action: $story_id ===
Timestamp: $timestamp
$details
EOF
}

# Run Claude with the story
run_claude() {
    local story_id=$1
    local attempt=$2
    local story_details=$(get_story_details "$story_id")
    local story_title=$(echo "$story_details" | jq -r '.title')
    local story_description=$(echo "$story_details" | jq -r '.description')
    local acceptance_criteria=$(echo "$story_details" | jq -r '.acceptanceCriteria | map("- " + .) | join("\n")')
    local files=$(echo "$story_details" | jq -r '.files | map("- " + .) | join("\n")')
    local deps=$(echo "$story_details" | jq -r '.dependencies | join(", ")')

    log "Executing story: $story_title (Attempt $attempt/$MAX_ATTEMPTS_PER_STORY)"

    # Read the prompt template
    local prompt_template=$(cat "$PROMPT_FILE")

    # Build the full prompt
    local prompt="
$prompt_template

---

## Current Story: $story_id - $story_title

**Description:**
$story_description

**Dependencies:** ${deps:-None}

**Files to create/modify:**
$files

**Acceptance Criteria:**
$acceptance_criteria

---

## Progress Context (Last 30 lines):
$(tail -30 "$PROGRESS_FILE" 2>/dev/null || echo "No previous progress")

---

## Instructions:
1. Implement this story according to the acceptance criteria above
2. Run tests: npm test
3. Run type-check: npm run type-check
4. If all pass, commit with message: \"feat($story_id): $story_title\"
5. Report success or failure

Begin implementation now.
"

    # Change to project root
    cd "$PROJECT_ROOT"

    # Run Claude in non-interactive mode
    echo "$prompt" | claude --yes --dangerously-skip-permissions 2>&1 | tee -a "$LOG_FILE"
    local exit_code=${PIPESTATUS[1]}

    cd "$RALPH_DIR"
    return $exit_code
}

# Verify story completion
verify_story() {
    local story_id=$1

    log "Verifying story: $story_id"

    cd "$PROJECT_ROOT"

    # Run type-check
    if ! npm run type-check 2>&1 | tee -a "$LOG_FILE"; then
        log_error "Type-check failed for story: $story_id"
        cd "$RALPH_DIR"
        return 1
    fi

    # Run tests
    if ! npm test 2>&1 | tee -a "$LOG_FILE"; then
        log_error "Tests failed for story: $story_id"
        cd "$RALPH_DIR"
        return 1
    fi

    cd "$RALPH_DIR"
    log_success "Story verified: $story_id"
    return 0
}

# Check if all stories are complete
all_stories_complete() {
    local incomplete=$(jq '[.userStories[] | select(.passes == false)] | length' "$PRD_FILE")
    [ "$incomplete" -eq 0 ]
}

# Print summary
print_summary() {
    local total=$(jq '.userStories | length' "$PRD_FILE")
    local completed=$(jq '[.userStories[] | select(.passes == true)] | length' "$PRD_FILE")
    local remaining=$((total - completed))

    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════${NC}"
    echo -e "${CYAN}           RALPH SESSION SUMMARY            ${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════${NC}"
    echo -e "Total Stories:     $total"
    echo -e "Completed:         ${GREEN}$completed${NC}"
    echo -e "Remaining:         ${YELLOW}$remaining${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════${NC}"

    if [ "$remaining" -eq 0 ]; then
        echo -e "${GREEN}<promise>COMPLETE</promise>${NC}"
    fi
}

# Main loop
main() {
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════${NC}"
    echo -e "${CYAN}     RALPH - Autonomous Development Loop    ${NC}"
    echo -e "${CYAN}     Based on Ryan Carson's Methodology     ${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════${NC}"
    echo ""

    log "Max iterations: $MAX_ITERATIONS"
    log "PRD file: $PRD_FILE"
    log "Project root: $PROJECT_ROOT"

    check_prerequisites

    # Initialize progress file header if empty
    if [ ! -s "$PROGRESS_FILE" ]; then
        cat > "$PROGRESS_FILE" << EOF
# Ralph Progress Log
# GZ Businessplan Generator
# Started: $(date)
#
# Format:
# === Action: Story-ID ===
# Timestamp: YYYY-MM-DD HH:MM:SS
# Details...

EOF
    fi

    local iteration=0
    local completed=0
    local failed=0
    local story_attempts=0

    while [ $iteration -lt $MAX_ITERATIONS ]; do
        iteration=$((iteration + 1))

        echo ""
        log "═══ Iteration $iteration of $MAX_ITERATIONS ═══"

        # Check if all done
        if all_stories_complete; then
            log_success "All stories completed!"
            break
        fi

        # Get next eligible story
        local story_id=$(get_next_story)

        if [ -z "$story_id" ]; then
            log_warning "No eligible stories (dependencies not met or all complete)"
            break
        fi

        local story_title=$(jq -r ".userStories[] | select(.id == \"$story_id\") | .title" "$PRD_FILE")
        log "Processing: $story_id - $story_title"

        # Track attempts for this story
        story_attempts=$((story_attempts + 1))

        append_progress "$story_id" "STARTED" "Attempt: $story_attempts
Title: $story_title"

        # Run Claude
        if run_claude "$story_id" "$story_attempts"; then
            # Verify
            if verify_story "$story_id"; then
                update_story_passes "$story_id" "true"
                update_metadata
                completed=$((completed + 1))
                story_attempts=0

                append_progress "$story_id" "COMPLETED" "Iteration: $iteration
Verification: PASSED
Files changed: See git log"

                log_success "Story completed: $story_id"
            else
                if [ $story_attempts -ge $MAX_ATTEMPTS_PER_STORY ]; then
                    failed=$((failed + 1))
                    story_attempts=0

                    append_progress "$story_id" "BLOCKED" "Failed after $MAX_ATTEMPTS_PER_STORY attempts
Moving to next story"

                    log_error "Story blocked after $MAX_ATTEMPTS_PER_STORY attempts: $story_id"
                else
                    append_progress "$story_id" "RETRY" "Verification failed, will retry
Attempt $story_attempts of $MAX_ATTEMPTS_PER_STORY"

                    log_warning "Verification failed, will retry: $story_id"
                fi
            fi
        else
            if [ $story_attempts -ge $MAX_ATTEMPTS_PER_STORY ]; then
                failed=$((failed + 1))
                story_attempts=0

                append_progress "$story_id" "BLOCKED" "Execution failed after $MAX_ATTEMPTS_PER_STORY attempts
Moving to next story"

                log_error "Story blocked after $MAX_ATTEMPTS_PER_STORY attempts: $story_id"
            else
                append_progress "$story_id" "RETRY" "Execution failed, will retry
Attempt $story_attempts of $MAX_ATTEMPTS_PER_STORY"

                log_warning "Execution failed, will retry: $story_id"
            fi
        fi

        # Brief pause between iterations
        sleep 2
    done

    # Final summary
    echo ""
    log "═══ Ralph Session Complete ═══"
    log "Iterations: $iteration"
    log "Completed: $completed"
    log "Failed/Blocked: $failed"

    append_progress "SESSION" "ENDED" "Iterations: $iteration
Completed: $completed
Failed: $failed"

    update_metadata
    print_summary
}

# Run main
main "$@"
