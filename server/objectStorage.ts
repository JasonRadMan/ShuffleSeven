// Object Storage integration using Replit client
import { Client } from "@replit/object-storage";
import { Response } from "express";
import { randomUUID } from "crypto";
import {
  ObjectAclPolicy,
  ObjectPermission,
  canAccessObject,
  getObjectAclPolicy,
  setObjectAclPolicy,
} from "./objectAcl";

// Get REPLIT_SIDECAR_ENDPOINT from environment
const REPLIT_SIDECAR_ENDPOINT = process.env.REPLIT_SIDECAR_ENDPOINT || 'https://production-sidecar.replit.com';

// The object storage client is used to interact with the object storage service.
let objectStorageClient: Client;

try {
  objectStorageClient = new Client();
  console.log('✅ Object storage client initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize object storage client:', error);
  throw new Error('Object storage client initialization failed');
}

export { objectStorageClient };

export class ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}

// The object storage service is used to interact with the object storage service.
export class ObjectStorageService {
  constructor() {}

  // Gets the public object search paths.
  getPublicObjectSearchPaths(): Array<string> {
    const pathsStr = process.env.PUBLIC_OBJECT_SEARCH_PATHS || "";
    const paths = Array.from(
      new Set(
        pathsStr
          .split(",")
          .map((path) => path.trim())
          .filter((path) => path.length > 0)
      )
    );
    if (paths.length === 0) {
      throw new Error(
        "PUBLIC_OBJECT_SEARCH_PATHS not set. Create a bucket in 'Object Storage' " +
          "tool and set PUBLIC_OBJECT_SEARCH_PATHS env var (comma-separated paths)."
      );
    }
    return paths;
  }

  // Gets the private object directory.
  getPrivateObjectDir(): string {
    const dir = process.env.PRIVATE_OBJECT_DIR || "";
    if (!dir) {
      throw new Error(
        "PRIVATE_OBJECT_DIR not set. Create a bucket in 'Object Storage' " +
          "tool and set PRIVATE_OBJECT_DIR env var."
      );
    }
    return dir;
  }

  // Debug: List all objects in the bucket
  async listBucketContents(): Promise<void> {
    try {
      console.log(`📋 Listing bucket contents...`);
      const result = await objectStorageClient.list();
      if (result.ok) {
        console.log(`📂 Found ${result.value.length} objects:`);
        result.value.forEach(obj => console.log(`   - ${obj.name}`));
      } else {
        console.log(`❌ Failed to list bucket: ${result.error?.message}`);
      }
    } catch (error) {
      console.log(`❌ Error listing bucket: ${(error as Error).message}`);
    }
  }

  // List and organize card files by category
  async listCardFiles(): Promise<{ [category: string]: string[] }> {
    try {
      const result = await objectStorageClient.list();
      if (!result.ok) {
        throw new Error(`Failed to list storage: ${result.error?.message}`);
      }
      
      // Filter and organize card files by category
      const cardFiles: { [category: string]: string[] } = {};
      
      result.value.forEach((obj: any) => {
        // Look for card image patterns
        const cardPatterns = [
          /^Cards\/(\w+)\/([A-Z]\d+\.png)$/i,           // Cards/Wisdom/W0001.png
          /^objects\/cards\/(\w+)\/([A-Z]\d+\.png)$/i,  // objects/cards/wisdom/W0001.png
          /^cards\/(\w+)\/([A-Z]\d+\.png)$/i,           // cards/wisdom/W0001.png
          /^(\w+)\/([A-Z]\d+\.png)$/i                   // wisdom/W0001.png
        ];
        
        for (const pattern of cardPatterns) {
          const match = obj.name.match(pattern);
          if (match) {
            const category = match[1].toLowerCase();
            const filename = match[2];
            
            if (!cardFiles[category]) {
              cardFiles[category] = [];
            }
            if (!cardFiles[category].includes(filename)) {
              cardFiles[category].push(filename);
            }
            break;
          }
        }
      });
      
      // Sort files within each category
      Object.keys(cardFiles).forEach(category => {
        cardFiles[category].sort();
      });
      
      return cardFiles;
    } catch (error) {
      console.error('Error listing card files:', error);
      throw error;
    }
  }

  // Search for a public object from the search paths.
  async searchPublicObject(filePath: string): Promise<string | null> {
    console.log(`🔍 Starting search for: ${filePath}`);
    
    try {
      // Get all objects in bucket first - safer than downloadAsStream
      const listResult = await objectStorageClient.list();
      if (!listResult.ok) {
        console.log(`❌ Failed to list bucket: ${listResult.error?.message}`);
        return null;
      }
      
      // Build search patterns based on the file path
      const capitalizedPath = filePath.replace(/^(\w+)\//, (match, category) => {
        const categoryMap = {
          'wisdom': 'Wisdom',
          'challenge': 'Challenge', 
          'knowledge': 'Knowledge',
          'leadership': 'Leadership',
          'possibilities': 'Possibilities',
          'tongue n cheek': 'Tongue N Cheek',
          'health': 'Healing'  // Note: Health -> Healing in bucket
        };
        return `${categoryMap[category.toLowerCase()] || category}/`;
      });
      
      const searchPatterns = [
        `Cards/${capitalizedPath}`,   // Cards/Wisdom/W0001.png
        `objects/cards/${filePath}`,  // objects/cards/wisdom/W0001.png
        `cards/${filePath}`,          // cards/wisdom/W0001.png  
        `${filePath}`                 // wisdom/W0001.png
      ];
      
      // Look for exact matches in bucket listing
      for (const pattern of searchPatterns) {
        console.log(`📁 Looking for: ${pattern}`);
        const found = listResult.value.find(obj => obj.name === pattern);
        if (found) {
          console.log(`🎉 Found exact match: ${found.name}`);
          return found.name;
        }
      }
      
      // If no exact match, try partial matches (for debugging)
      console.log(`🔍 No exact match found, checking partial matches for filename...`);
      const filename = filePath.split('/').pop(); // Get W0001.png from wisdom/W0001.png
      
      if (filename) {
        const partialMatches = listResult.value.filter(obj => obj.name.endsWith(filename));
        if (partialMatches.length > 0) {
          console.log(`🔍 Found ${partialMatches.length} files ending with ${filename}:`);
          partialMatches.forEach(match => console.log(`   - ${match.name}`));
          // Return the first match
          console.log(`🎯 Using first match: ${partialMatches[0].name}`);
          return partialMatches[0].name;
        }
      }
      
      console.log(`❌ File not found: ${filePath}`);
      return null;
      
    } catch (error) {
      console.error('Error searching for public object:', error);
      return null;
    }
  }

  // Downloads an object to the response.
  async downloadObject(objectPath: string, res: Response, cacheTtlSec: number = 3600) {
    try {
      console.log(`📥 Attempting to download: ${objectPath}`);
      
      // Use Replit client to download as stream - returns stream directly
      const stream = await objectStorageClient.downloadAsStream(objectPath);
      console.log(`📊 Stream created:`, typeof stream, stream?.readable, stream?.destroyed);
      
      if (!stream) {
        console.error(`❌ No stream returned for ${objectPath}`);
        res.status(404).json({ error: 'File not found' });
        return;
      }
      
      console.log(`✅ Stream created successfully for ${objectPath}`);
      console.log(`📋 Stream readable: ${stream.readable}, destroyed: ${stream.destroyed}`);
      
      // Set appropriate headers - assume images are PNG for now
      res.set({
        "Content-Type": "image/png",
        "Cache-Control": `public, max-age=${cacheTtlSec}`,
      });
      
      // Handle stream errors immediately to prevent unhandled errors
      stream.on('error', (error) => {
        console.error('Stream error:', error);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Failed to stream file' });
        }
      });
      
      // Handle response errors to prevent unhandled errors
      res.on('error', (error) => {
        console.error('Response stream error:', error);
      });
      
      // Handle response close/finish to clean up stream
      res.on('close', () => {
        if (stream.destroy) {
          stream.destroy();
        }
      });
      
      // Pipe the stream to the response
      stream.pipe(res);
      console.log(`🚀 Stream piped to response for ${objectPath}`);
      
    } catch (error) {
      console.error('Download error:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to download file' });
      }
    }
  }

  // Gets the upload URL for an object entity.
  async getObjectEntityUploadURL(): Promise<string> {
    const privateObjectDir = this.getPrivateObjectDir();
    if (!privateObjectDir) {
      throw new Error(
        "PRIVATE_OBJECT_DIR not set. Create a bucket in 'Object Storage' " +
          "tool and set PRIVATE_OBJECT_DIR env var."
      );
    }

    const objectId = randomUUID();
    const fullPath = `${privateObjectDir}/uploads/${objectId}`;

    const { bucketName, objectName } = parseObjectPath(fullPath);

    // Sign URL for PUT method with TTL
    return signObjectURL({
      bucketName,
      objectName,
      method: "PUT",
      ttlSec: 900,
    });
  }

  // Gets the object entity file from the object path.
  async getObjectEntityFile(objectPath: string): Promise<File> {
    if (!objectPath.startsWith("/objects/")) {
      throw new ObjectNotFoundError();
    }

    const parts = objectPath.slice(1).split("/");
    if (parts.length < 2) {
      throw new ObjectNotFoundError();
    }

    const entityId = parts.slice(1).join("/");
    let entityDir = this.getPrivateObjectDir();
    if (!entityDir.endsWith("/")) {
      entityDir = `${entityDir}/`;
    }
    const objectEntityPath = `${entityDir}${entityId}`;
    const { bucketName, objectName } = parseObjectPath(objectEntityPath);
    const bucket = objectStorageClient.bucket(bucketName);
    const objectFile = bucket.file(objectName);
    const [exists] = await objectFile.exists();
    if (!exists) {
      throw new ObjectNotFoundError();
    }
    return objectFile;
  }

  normalizeObjectEntityPath(
    rawPath: string,
  ): string {
    if (!rawPath.startsWith("https://storage.googleapis.com/")) {
      return rawPath;
    }
  
    // Extract the path from the URL by removing query parameters and domain
    const url = new URL(rawPath);
    const rawObjectPath = url.pathname;
  
    let objectEntityDir = this.getPrivateObjectDir();
    if (!objectEntityDir.endsWith("/")) {
      objectEntityDir = `${objectEntityDir}/`;
    }
  
    if (!rawObjectPath.startsWith(objectEntityDir)) {
      return rawObjectPath;
    }
  
    // Extract the entity ID from the path
    const entityId = rawObjectPath.slice(objectEntityDir.length);
    return `/objects/${entityId}`;
  }

  // Tries to set the ACL policy for the object entity and return the normalized path.
  async trySetObjectEntityAclPolicy(
    rawPath: string,
    aclPolicy: ObjectAclPolicy
  ): Promise<string> {
    const normalizedPath = this.normalizeObjectEntityPath(rawPath);
    if (!normalizedPath.startsWith("/")) {
      return normalizedPath;
    }

    const objectFile = await this.getObjectEntityFile(normalizedPath);
    await setObjectAclPolicy(objectFile, aclPolicy);
    return normalizedPath;
  }

  // Checks if the user can access the object entity.
  async canAccessObjectEntity({
    userId,
    objectFile,
    requestedPermission,
  }: {
    userId?: string;
    objectFile: File;
    requestedPermission?: ObjectPermission;
  }): Promise<boolean> {
    return canAccessObject({
      userId,
      objectFile,
      requestedPermission: requestedPermission ?? ObjectPermission.READ,
    });
  }
}

function parseObjectPath(path: string): {
  bucketName: string;
  objectName: string;
} {
  if (!path.startsWith("/")) {
    path = `/${path}`;
  }
  const pathParts = path.split("/");
  if (pathParts.length < 3) {
    throw new Error("Invalid path: must contain at least a bucket name");
  }

  const bucketName = pathParts[1];
  const objectName = pathParts.slice(2).join("/");

  return {
    bucketName,
    objectName,
  };
}

async function signObjectURL({
  bucketName,
  objectName,
  method,
  ttlSec,
}: {
  bucketName: string;
  objectName: string;
  method: "GET" | "PUT" | "DELETE" | "HEAD";
  ttlSec: number;
}): Promise<string> {
  const request = {
    bucket_name: bucketName,
    object_name: objectName,
    method,
    expires_at: new Date(Date.now() + ttlSec * 1000).toISOString(),
  };
  const response = await fetch(
    `${REPLIT_SIDECAR_ENDPOINT}/object-storage/signed-object-url`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    }
  );
  if (!response.ok) {
    throw new Error(
      `Failed to sign object URL, errorcode: ${response.status}, ` +
        `make sure you're running on Replit`
    );
  }

  const { signed_url: signedURL } = await response.json();
  return signedURL;
}