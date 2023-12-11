import { getDb, putDb } from './database';
import { header } from './header';

export default class {
  constructor() {
    // Retrieve local data, if any
    const localData = localStorage.getItem('content');

    // Check if CodeMirror is loaded
    if (typeof CodeMirror === 'undefined') {
      throw new Error('CodeMirror is not loaded');
    }

    // Initialize CodeMirror editor
    this.editor = CodeMirror(document.querySelector('#main'), {
      value: header, // Set a default value
      mode: 'javascript',
      theme: 'monokai',
      lineNumbers: true,
      lineWrapping: true,
      autofocus: true,
      indentUnit: 2,
      tabSize: 2,
    });

    // Load data from IndexedDB and set it in the editor
    getDb().then((data) => {
      console.info('Loaded data from IndexedDB, injecting into editor');
      let editorContent = header;

      // Check if data is an array and has at least one entry with a 'value' key
      if (Array.isArray(data) && data.length > 0 && 'value' in data[0]) {
        editorContent = data[0].value;
      } else if (localData) {
        // Fallback to localStorage if IndexedDB data is not suitable
        editorContent = localData;
      }

      this.editor.setValue(editorContent);
    }).catch(error => {
      console.error('Failed to load content from IndexedDB:', error);
      // Fallback to localStorage or header if there was an error fetching from IndexedDB
      this.editor.setValue(localData || header);
    });

    // Event listener for content changes
    this.editor.on('change', () => {
      localStorage.setItem('content', this.editor.getValue());
    });

    // Event listener for editor losing focus
    this.editor.on('blur', () => {
      console.log('The editor has lost focus');
      putDb(this.editor.getValue());
    });
  }
}


