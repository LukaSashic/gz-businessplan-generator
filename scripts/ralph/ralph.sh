#!/bin/bash
#
# Ralph - Autonomous Development Loop
#
# Usage: ./ralph.sh [max_iterations]
# Example: ./ralph.sh 25
#
# Ralph executes user stories from prd.json autonomously,
# committing after each successful story.
#

set -e

# Configuration
MAX_ITERATIONS=${1:-10}
RALPH_DIR="$(dirname "$0")"
PRD_FILE="$RALPH_DIR/prd.json"
PROGRESS_FILE="$RALPH_DIR/progress.txt"
PROMPT_FILE="$RALPH_DIR/prompt.md"
LOG_FILE="$RALPH_DIR/ralph.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."

    if ! command -v claude &> /dev/null; then
        log_error "Claude CLI not found. Install with: npm install -g @anthropic-ai/claude-code"
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

    log_success "Prerequisites check passed"
}

# Get next pending story from prd.json
get_next_story() {
    # Find first story with status "pending"
    local story=$(jq -r '.stories[] | select(.status == "pending") | .id' "$PRD_FILE" | head -1)
    echo "$story"
}

# Get story details
get_story_details() {
    local story_id=$1
    jq -r ".stories[] | select(.id == \"$story_id\")" "$PRD_FILE"
}

# Update story status in prd.json
update_story_status() {
    local story_id=$1
    local status=$2

    # Create temp file with updated status
    jq "(.stories[] | select(.id == \"$story_id\")).status = \"$status\"" "$PRD_FILE" > "$PRD_FILE.tmp"
    mv "$PRD_FILE.tmp" "$PRD_FILE"
}

# Append to progress.txt
append_progress() {
    local message=$1
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] $message" >> "$PROGRESS_FILE"
}

# Run Claude with the story
run_claude() {
    local story_id=$1
    local story_details=$(get_story_details "$story_id")
    local story_title=$(echo "$story_details" | jq -r '.title')
    local story_description=$(echo "$story_details" | jq -r '.description')
    local acceptance_criteria=$(echo "$story_details" | jq -r '.acceptanceCriteria | join("\n- ")')

    log "Executing story: $story_title"

    # Build the prompt
    local prompt="
## Current Story: $story_id - $story_title

$story_description

### Acceptance Criteria:
- $acceptance_criteria

### Instructions:
1. Read the prompt file for context: $PROMPT_FILE
2. Implement this story following the acceptance criteria
3. Run tests to verify: npm test
4. Run type-check: npm run type-check
5. If all pass, commit with descriptive message

### Progress Context:
$(tail -20 "$PROGRESS_FILE" 2>/dev/null || echo "No previous progress")

Begin implementation now.
"

    # Run Claude in non-interactive mode
    echo "$prompt" | claude --yes --dangerously-skip-permissions 2>&1 | tee -a "$LOG_FILE"

    return ${PIPESTATUS[1]}
}

# Verify story completion
verify_story() {
    local story_id=$1

    log "Verifying story: $story_id"

    # Run tests
    if ! npm test 2>&1 | tee -a "$LOG_FILE"; then
        log_error "Tests failed for story: $story_id"
        return 1
    fi

    # Run type-check
    if ! npm run type-check 2>&1 | tee -a "$LOG_FILE"; then
        log_error "Type-check failed for story: $story_id"
        return 1
    fi

    log_success "Story verified: $story_id"
    return 0
}

# Main loop
main() {
    log "=== Ralph Autonomous Development Loop ==="
    log "Max iterations: $MAX_ITERATIONS"
    log "PRD file: $PRD_FILE"

    check_prerequisites

    # Initialize progress file if doesn't exist
    if [ ! -f "$PROGRESS_FILE" ]; then
        echo "# Ralph Progress Log" > "$PROGRESS_FILE"
        echo "Started: $(date)" >> "$PROGRESS_FILE"
        echo "" >> "$PROGRESS_FILE"
    fi

    local iteration=0
    local completed=0
    local failed=0

    while [ $iteration -lt $MAX_ITERATIONS ]; do
        iteration=$((iteration + 1))
        log ""
        log "=== Iteration $iteration of $MAX_ITERATIONS ==="

        # Get next story
        local story_id=$(get_next_story)

        if [ -z "$story_id" ]; then
            log_success "All stories completed!"
            break
        fi

        log "Processing story: $story_id"
        update_story_status "$story_id" "in_progress"
        append_progress "Started: $story_id"

        # Run Claude
        if run_claude "$story_id"; then
            # Verify
            if verify_story "$story_id"; then
                update_story_status "$story_id" "completed"
                append_progress "Completed: $story_id"
                completed=$((completed + 1))
                log_success "Story completed: $story_id"
            else
                update_story_status "$story_id" "failed"
                append_progress "Failed verification: $story_id"
                failed=$((failed + 1))
                log_error "Story failed verification: $story_id"
            fi
        else
            update_story_status "$story_id" "failed"
            append_progress "Failed execution: $story_id"
            failed=$((failed + 1))
            log_error "Story failed execution: $story_id"
        fi

        # Brief pause between iterations
        sleep 2
    done

    log ""
    log "=== Ralph Session Complete ==="
    log "Iterations: $iteration"
    log "Completed: $completed"
    log "Failed: $failed"

    append_progress "Session complete: $completed completed, $failed failed"
}

# Run main
main
