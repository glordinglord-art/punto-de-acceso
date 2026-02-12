import { Injectable, OnModuleInit } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseStorageService implements OnModuleInit {
  private supabase!: SupabaseClient;
  private readonly bucketName = 'meal-images';

  onModuleInit() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_KEY;

    if (!url || !key) {
      console.warn('⚠️ SUPABASE_URL or SUPABASE_KEY not set — image upload disabled');
      return;
    }

    this.supabase = createClient(url, key);
  }

  async uploadImage(base64Data: string, fileName: string): Promise<string | null> {
    if (!this.supabase) return null;

    try {
      // Remove data:image prefix if present
      const base64Clean = base64Data.includes(',')
        ? base64Data.split(',')[1]
        : base64Data;

      const buffer = Buffer.from(base64Clean, 'base64');

      // Detect mime type from prefix or default to jpeg
      let mimeType = 'image/jpeg';
      if (base64Data.startsWith('data:image/png')) mimeType = 'image/png';
      else if (base64Data.startsWith('data:image/webp')) mimeType = 'image/webp';

      const ext = mimeType.split('/')[1];
      const filePath = `${Date.now()}-${fileName}.${ext}`;

      const { error } = await this.supabase.storage
        .from(this.bucketName)
        .upload(filePath, buffer, {
          contentType: mimeType,
          upsert: false,
        });

      if (error) {
        console.error('Supabase upload error:', error.message);
        return null;
      }

      // Get public URL
      const { data } = this.supabase.storage
        .from(this.bucketName)
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (err) {
      console.error('Error uploading image:', err);
      return null;
    }
  }
}
