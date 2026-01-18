import { get, set, del, entries } from 'idb-keyval';
import type { ChatMessage } from '@/types/chat';

const DB_PREFIX = 'gz-workshop-';
const MESSAGES_PREFIX = 'gz-messages-';

export const persistence = {
  // Save workshop data to IndexedDB
  async saveWorkshopData(workshopId: string, data: Record<string, any>) {
    try {
      await set(`${DB_PREFIX}${workshopId}`, {
        data,
        timestamp: new Date().toISOString(),
      });
      return true;
    } catch (error) {
      console.error('Error saving to IndexedDB:', error);
      return false;
    }
  },

  // Load workshop data from IndexedDB
  async loadWorkshopData(workshopId: string): Promise<{
    data: Record<string, any>;
    timestamp: string;
  } | null> {
    try {
      const result = await get(`${DB_PREFIX}${workshopId}`);
      return result || null;
    } catch (error) {
      console.error('Error loading from IndexedDB:', error);
      return null;
    }
  },

  // Delete workshop data from IndexedDB
  async deleteWorkshopData(workshopId: string) {
    try {
      await del(`${DB_PREFIX}${workshopId}`);
      return true;
    } catch (error) {
      console.error('Error deleting from IndexedDB:', error);
      return false;
    }
  },

  // List all workshop IDs in IndexedDB
  async listWorkshops(): Promise<string[]> {
    try {
      const allEntries = await entries();
      return allEntries
        .filter(([key]) => String(key).startsWith(DB_PREFIX))
        .map(([key]) => String(key).replace(DB_PREFIX, ''));
    } catch (error) {
      console.error('Error listing workshops:', error);
      return [];
    }
  },

  // Clear all workshop data (for testing)
  async clearAll() {
    try {
      const workshopIds = await this.listWorkshops();
      await Promise.all(workshopIds.map((id) => this.deleteWorkshopData(id)));
      return true;
    } catch (error) {
      console.error('Error clearing all data:', error);
      return false;
    }
  },

  // Save chat messages to IndexedDB
  async saveChatMessages(workshopId: string, messages: ChatMessage[]) {
    try {
      await set(`${MESSAGES_PREFIX}${workshopId}`, {
        messages,
        timestamp: new Date().toISOString(),
      });
      return true;
    } catch (error) {
      console.error('Error saving messages to IndexedDB:', error);
      return false;
    }
  },

  // Load chat messages from IndexedDB
  async loadChatMessages(workshopId: string): Promise<{
    messages: ChatMessage[];
    timestamp: string;
  } | null> {
    try {
      const result = await get(`${MESSAGES_PREFIX}${workshopId}`);
      return result || null;
    } catch (error) {
      console.error('Error loading messages from IndexedDB:', error);
      return null;
    }
  },

  // Delete chat messages from IndexedDB
  async deleteChatMessages(workshopId: string) {
    try {
      await del(`${MESSAGES_PREFIX}${workshopId}`);
      return true;
    } catch (error) {
      console.error('Error deleting messages from IndexedDB:', error);
      return false;
    }
  },
};
