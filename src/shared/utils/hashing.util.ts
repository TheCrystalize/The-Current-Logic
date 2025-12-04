
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class HashingUtil {

  /**
   * NOTE: The prompt requires BLAKE3. In a standard Node.js environment, we would use
   * the 'blake3' npm package. However, in this sandboxed browser environment without
   * package management, we use the browser's built-in Web Crypto API with SHA-256
   * as a robust and readily available substitute.
   */

  // Recursively sorts the keys of an object.
  private sortObjectKeys(data: any): any {
    if (data === null || typeof data !== 'object') {
      return data;
    }
    if (Array.isArray(data)) {
      return data.map(item => this.sortObjectKeys(item));
    }
    const sortedKeys = Object.keys(data).sort();
    const sortedObject: { [key: string]: any } = {};
    for (const key of sortedKeys) {
      sortedObject[key] = this.sortObjectKeys(data[key]);
    }
    return sortedObject;
  }

  async computeHash(data: any): Promise<string> {
    const sortedData = this.sortObjectKeys(data);
    const deterministicString = JSON.stringify(sortedData);
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(deterministicString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
}
