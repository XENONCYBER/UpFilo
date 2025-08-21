import Quill from 'quill';

interface ActiveUser {
  userName: string;
  lastActivity: number;
  messageCount: number;
  isActive?: boolean;
}

interface MentionModuleOptions {
  users: ActiveUser[];
  onMentionSelect?: (userName: string) => void;
}

export class MentionModule {
  quill: Quill;
  options: MentionModuleOptions;
  mentionContainer: HTMLElement | null = null;
  isOpen = false;
  searchTerm = '';
  mentionStartIndex = -1;

  constructor(quill: Quill, options: MentionModuleOptions) {
    this.quill = quill;
    this.options = options;
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Listen for text changes to detect @ symbol
    this.quill.on('text-change', (delta, oldDelta, source) => {
      if (source === 'user') {
        this.handleTextChange();
      }
    });

    // Listen for selection changes to close mention dropdown when cursor moves
    this.quill.on('selection-change', (range, oldRange, source) => {
      if (this.isOpen && range) {
        const mentionRange = this.getMentionRange(range.index);
        if (!mentionRange) {
          this.closeMentionDropdown();
        }
      }
    });

    // Handle keyboard events for mention navigation
    this.quill.keyboard.addBinding({
      key: 'ArrowUp',
      handler: () => {
        if (this.isOpen) {
          this.navigateMentions('up');
          return false; // Prevent default behavior
        }
        return true;
      }
    });

    this.quill.keyboard.addBinding({
      key: 'ArrowDown',
      handler: () => {
        if (this.isOpen) {
          this.navigateMentions('down');
          return false;
        }
        return true;
      }
    });

    this.quill.keyboard.addBinding({
      key: 'Enter',
      handler: () => {
        if (this.isOpen) {
          this.selectCurrentMention();
          return false;
        }
        return true;
      }
    });

    this.quill.keyboard.addBinding({
      key: 'Escape',
      handler: () => {
        if (this.isOpen) {
          this.closeMentionDropdown();
          return false;
        }
        return true;
      }
    });
  }

  handleTextChange() {
    const selection = this.quill.getSelection();
    if (!selection) return;

    console.log('Text changed, current selection:', selection);
    const mentionRange = this.getMentionRange(selection.index);
    console.log('Mention range:', mentionRange);
    
    if (mentionRange) {
      this.searchTerm = mentionRange.searchTerm;
      this.mentionStartIndex = mentionRange.startIndex;
      
      console.log('Found mention range - searchTerm:', this.searchTerm, 'startIndex:', this.mentionStartIndex);
      
      if (!this.isOpen) {
        console.log('Opening mention dropdown');
        this.openMentionDropdown(selection.index);
      } else {
        console.log('Updating mention dropdown');
        this.updateMentionDropdown();
      }
    } else if (this.isOpen) {
      console.log('No mention range found, closing dropdown');
      this.closeMentionDropdown();
    }
  }

  getMentionRange(cursorIndex: number) {
    const text = this.quill.getText();
    
    // Look backwards from cursor to find @ symbol
    let startIndex = cursorIndex - 1;
    while (startIndex >= 0 && text[startIndex] !== '@' && text[startIndex] !== ' ' && text[startIndex] !== '\n') {
      startIndex--;
    }
    
    if (startIndex >= 0 && text[startIndex] === '@') {
      const searchTerm = text.slice(startIndex + 1, cursorIndex);
      // Only show mentions if we have a reasonable search term (no spaces)
      if (!searchTerm.includes(' ') && !searchTerm.includes('\n')) {
        return {
          startIndex: startIndex, // Include the @ symbol position
          searchTerm
        };
      }
    }
    
    return null;
  }

  openMentionDropdown(cursorIndex: number) {
    this.isOpen = true;
    this.createMentionContainer();
    this.positionMentionDropdown(cursorIndex);
    this.updateMentionDropdown();
  }

  createMentionContainer() {
    // Remove existing container if any
    if (this.mentionContainer) {
      this.mentionContainer.remove();
    }

    this.mentionContainer = document.createElement('div');
    this.mentionContainer.className = 'mention-dropdown fixed z-50 bg-neomorphic-surface border border-neomorphic-border rounded-neomorphic shadow-neomorphic max-h-48 overflow-y-auto min-w-[200px]';
    document.body.appendChild(this.mentionContainer);
  }

  positionMentionDropdown(cursorIndex: number) {
    if (!this.mentionContainer) return;

    const bounds = this.quill.getBounds(cursorIndex);
    if (!bounds) return;
    
    const quillContainer = this.quill.container;
    const quillRect = quillContainer.getBoundingClientRect();

    this.mentionContainer.style.top = `${quillRect.top + bounds.top + bounds.height + 5}px`;
    this.mentionContainer.style.left = `${quillRect.left + bounds.left}px`;
  }

  updateMentionDropdown() {
    if (!this.mentionContainer) return;

    const filteredUsers = this.options.users.filter(user =>
      user.userName.toLowerCase().includes(this.searchTerm.toLowerCase())
    );

    console.log('Updating mention dropdown with users:', filteredUsers);
    console.log('Search term:', this.searchTerm);

    if (filteredUsers.length === 0) {
      console.log('No filtered users found, closing dropdown');
      this.closeMentionDropdown();
      return;
    }

    this.mentionContainer.innerHTML = `
      <div class="py-2">
        ${filteredUsers.map((user, index) => `
          <div class="mention-item flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors hover:bg-neomorphic-border/20 ${index === 0 ? 'selected bg-electric-blue/10 text-electric-blue' : ''}" data-username="${user.userName}">
            <div class="h-6 w-6 rounded-full bg-electric-blue/20 text-electric-blue text-xs flex items-center justify-center font-medium">
              ${user.userName.charAt(0).toUpperCase()}
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium truncate">${user.userName}</div>
              <div class="text-xs text-neomorphic-text-secondary">${this.getActivityStatus(user.lastActivity)}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    console.log('Dropdown HTML created, adding event listeners...');

    // Add click handlers
    this.mentionContainer.querySelectorAll('.mention-item').forEach((item, index) => {
      item.addEventListener('click', (e) => {
        console.log('Mention item clicked, event:', e);
        e.preventDefault();
        e.stopPropagation();
        const userName = item.getAttribute('data-username');
        console.log('Clicked username from attribute:', userName);
        console.log('Item element:', item);
        if (userName) {
          console.log('About to call selectMention with:', userName);
          this.selectMention(userName);
        } else {
          console.error('No username found in data-username attribute');
        }
      });
      
      // Also add mousedown to ensure we capture the event
      item.addEventListener('mousedown', (e) => {
        console.log('Mousedown on mention item');
        e.preventDefault();
      });
    });
  }

  navigateMentions(direction: 'up' | 'down') {
    if (!this.mentionContainer) return;

    const items = this.mentionContainer.querySelectorAll('.mention-item');
    const currentSelected = this.mentionContainer.querySelector('.mention-item.selected');
    let newIndex = 0;

    if (currentSelected) {
      const currentIndex = Array.from(items).indexOf(currentSelected);
      if (direction === 'up') {
        newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
      } else {
        newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
      }
    }

    // Update selected state
    items.forEach((item, index) => {
      if (index === newIndex) {
        item.classList.add('selected', 'bg-electric-blue/10', 'text-electric-blue');
      } else {
        item.classList.remove('selected', 'bg-electric-blue/10', 'text-electric-blue');
      }
    });
  }

  selectCurrentMention() {
    if (!this.mentionContainer) return;

    const selectedItem = this.mentionContainer.querySelector('.mention-item.selected');
    if (selectedItem) {
      const userName = selectedItem.getAttribute('data-username');
      if (userName) {
        this.selectMention(userName);
      }
    }
  }

  selectMention(userName: string) {
    console.log('selectMention called with:', userName);
    console.log('mentionStartIndex:', this.mentionStartIndex);
    
    // Replace the search term with the mention
    const range = this.quill.getSelection();
    console.log('current selection range:', range);
    
    if (range && this.mentionStartIndex >= 0) {
      // Get the current text to see what we're working with
      const currentText = this.quill.getText();
      console.log('current text around mention:', currentText.slice(Math.max(0, this.mentionStartIndex - 5), this.mentionStartIndex + 20));
      
      // Calculate the total length to delete: from @ symbol to current cursor
      const deleteLength = range.index - this.mentionStartIndex;
      console.log('deleteLength:', deleteLength, 'from index', this.mentionStartIndex, 'to', range.index);
      
      // Try a simpler approach: just delete and insert
      try {
        // Delete the @ symbol and search term
        this.quill.deleteText(this.mentionStartIndex, deleteLength);
        
        // Insert just the plain mention text first (without formatting to see if it works)
        this.quill.insertText(this.mentionStartIndex, `@${userName} `);
        
        // Set cursor after the mention
        const newCursorPosition = this.mentionStartIndex + userName.length + 2;
        console.log('setting cursor to position:', newCursorPosition);
        this.quill.setSelection(newCursorPosition);
        
        console.log('Mention insertion completed successfully');
      } catch (error) {
        console.error('Error during mention insertion:', error);
      }
    } else {
      console.log('Cannot insert mention: invalid range or mentionStartIndex');
    }

    this.closeMentionDropdown();
    
    // Call callback if provided
    if (this.options.onMentionSelect) {
      this.options.onMentionSelect(userName);
    }
  }

  closeMentionDropdown() {
    this.isOpen = false;
    if (this.mentionContainer) {
      this.mentionContainer.remove();
      this.mentionContainer = null;
    }
    this.searchTerm = '';
    this.mentionStartIndex = -1;
  }

  getActivityStatus(lastActivity: number): string {
    const now = Date.now();
    const diff = now - lastActivity;
    
    if (diff < 5 * 60 * 1000) { // 5 minutes
      return 'Active now';
    } else if (diff < 30 * 60 * 1000) { // 30 minutes
      return 'Recently active';
    } else if (diff < 24 * 60 * 60 * 1000) { // 24 hours
      return 'Active today';
    } else if (diff < 7 * 24 * 60 * 60 * 1000) { // 7 days
      return 'Active this week';
    } else {
      return 'Available';
    }
  }

  // Update users list (called when active users change)
  updateUsers(users: ActiveUser[]) {
    this.options.users = users;
    if (this.isOpen) {
      this.updateMentionDropdown();
    }
  }

  // Cleanup
  destroy() {
    this.closeMentionDropdown();
  }
}

// Register the module with Quill
export const registerMentionModule = () => {
  Quill.register('modules/mention', MentionModule);
};
