import { supabase } from '../supabaseClient';

// ==============================================
// CONFIGURACIÓN DE COMPRESIÓN MEJORADA
// ==============================================

interface CompressionConfig {
  maxWidth: number;
  maxHeight: number;
  quality: number;
  maxFileSizeMB: number;
}

const COMPRESSION_CONFIG: CompressionConfig = {
  maxWidth: 800,       // REDUCIDO: Ancho máximo más conservador
  maxHeight: 600,      // REDUCIDO: Alto máximo más conservador
  quality: 0.75,       // Calidad balanceada
  maxFileSizeMB: 0.5   // REDUCIDO: Más agresivo con la compresión
};

// ==============================================
// FUNCIONES DE COMPRESIÓN MEJORADAS
// ==============================================

/**
 * Comprime y redimensiona CUALQUIER imagen sin importar el formato
 */
const compressAndResizeImage = (file: File, config: CompressionConfig): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('No se pudo obtener el contexto del canvas'));
      return;
    }

    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        console.log(`📐 Dimensiones originales: ${img.width}x${img.height}`);
        
        // Calcular nuevas dimensiones manteniendo relación de aspecto
        let newWidth = img.width;
        let newHeight = img.height;
        
        // SIEMPRE redimensionar si excede los límites
        if (newWidth > config.maxWidth || newHeight > config.maxHeight) {
          const ratio = Math.min(
            config.maxWidth / newWidth,
            config.maxHeight / newHeight
          );
          newWidth = Math.floor(newWidth * ratio);
          newHeight = Math.floor(newHeight * ratio);
          console.log(`🔧 Redimensionando a: ${newWidth}x${newHeight}`);
        } else {
          console.log(`✅ Dimensiones dentro del límite, manteniendo: ${newWidth}x${newHeight}`);
        }

        // Configurar canvas con nuevas dimensiones
        canvas.width = newWidth;
        canvas.height = newHeight;

        // Dibujar imagen redimensionada
        ctx.drawImage(img, 0, 0, newWidth, newHeight);

        // Determinar el tipo MIME de salida (forzar JPEG para mejor compresión)
        const outputMimeType = 'image/jpeg';
        
        // Convertir a Blob con calidad reducida
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const reduction = ((file.size - blob.size) / file.size * 100).toFixed(1);
              console.log(`✅ Imagen procesada: ${(blob.size / 1024 / 1024).toFixed(2)}MB (original: ${(file.size / 1024 / 1024).toFixed(2)}MB) - Reducción: ${reduction}%`);
              resolve(blob);
            } else {
              reject(new Error('Error al procesar la imagen'));
            }
          },
          outputMimeType,
          config.quality
        );
      };

      img.onerror = () => {
        reject(new Error('Error al cargar la imagen para procesamiento'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Error al leer el archivo'));
    };

    reader.readAsDataURL(file);
  });
};

/**
 * Verifica si una imagen necesita procesamiento (más estricto)
 */
const needsProcessing = (file: File, config: CompressionConfig): boolean => {
  const isImage = file.type.startsWith('image/');
  const isLarge = file.size > config.maxFileSizeMB * 1024 * 1024;
  
  // Para debugging, mostrar info de la imagen
  if (isImage) {
    console.log(`🔍 Analizando imagen: ${file.name}`);
    console.log(`   - Tipo: ${file.type}`);
    console.log(`   - Tamaño: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
    console.log(`   - Necesita procesamiento: ${isLarge}`);
  }
  
  return isImage; // PROCESAR TODAS las imágenes, no solo las grandes
};

// ==============================================
// FUNCIONES PRINCIPALES DEL SERVICIO (ACTUALIZADAS)
// ==============================================

/**
 * Sube un avatar a Supabase Storage con compresión MEJORADA
 */
export const uploadAvatar = async (file: File, userId: string): Promise<string> => {
  try {
    console.log('🔼 Subiendo avatar para usuario:', userId);
    console.log(`📊 Tamaño original: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
    console.log(`📝 Tipo de archivo: ${file.type}`);
    
    let fileToUpload = file;
    
    // PROCESAR TODOS los avatares (más agresivo)
    if (file.type.startsWith('image/')) {
      console.log('🔧 Procesando avatar...');
      const avatarConfig = { 
        ...COMPRESSION_CONFIG, 
        maxWidth: 200,  // MÁS PEQUEÑO para avatares
        maxHeight: 200,
        quality: 0.6,   // MÁS COMPRESIÓN
        maxFileSizeMB: 0.2 
      };
      
      const processedBlob = await compressAndResizeImage(file, avatarConfig);
      fileToUpload = new File([processedBlob], `avatar-${Date.now()}.jpg`, { type: 'image/jpeg' });
      console.log(`✅ Avatar procesado: ${(fileToUpload.size / 1024 / 1024).toFixed(2)}MB`);
    }
    
    // Generar nombre único para el archivo
    const fileExt = 'jpg'; // Forzar JPEG para consistencia
    const fileName = `${userId}/avatar-${Date.now()}.${fileExt}`;
    
    // Subir archivo a Supabase Storage
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, fileToUpload, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) throw error;

    // Obtener URL pública del archivo
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    console.log('✅ Avatar subido exitosamente:', publicUrl);
    console.log(`📊 Tamaño final: ${(fileToUpload.size / 1024 / 1024).toFixed(2)}MB`);
    
    return publicUrl;

  } catch (error) {
    console.error('❌ Error subiendo avatar:', error);
    throw new Error('No se pudo subir la imagen: ' + (error as any).message);
  }
};

/**
 * Sube imágenes de posts a Supabase Storage con compresión MEJORADA
 */
export const uploadPostImages = async (images: (string | File)[], userId: string): Promise<string[]> => {
  try {
    console.log('📤 Subiendo imágenes de post para usuario:', userId);
    console.log('Imágenes a procesar:', images.length);

    let uploadedImageUrls: string[] = [];
    
    if (images && images.length > 0) {
      console.log('📤 Procesando imágenes...');
      
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        
        try {
          // Si es una URL blob (preview temporal), necesitamos convertirla a File y subirla
          if (typeof image === 'string' && image.startsWith('blob:')) {
            console.log(`\n🔄 Procesando imagen blob ${i + 1}/${images.length}...`);
            
            // Convertir la URL blob a File
            const response = await fetch(image);
            const blob = await response.blob();
            const originalFile = new File([blob], `post-image-${Date.now()}-${i}`, { type: blob.type });
            
            console.log(`📊 Tamaño original: ${(originalFile.size / 1024 / 1024).toFixed(2)}MB`);
            console.log(`📝 Tipo: ${originalFile.type}`);
            
            let fileToUpload = originalFile;
            
            // PROCESAR TODAS las imágenes de posts
            if (originalFile.type.startsWith('image/')) {
              console.log(`🔧 Procesando imagen ${i + 1}...`);
              const processedBlob = await compressAndResizeImage(originalFile, COMPRESSION_CONFIG);
              fileToUpload = new File([processedBlob], `post-${i}.jpg`, { type: 'image/jpeg' });
              console.log(`✅ Imagen ${i + 1} procesada: ${(fileToUpload.size / 1024 / 1024).toFixed(2)}MB`);
            }
            
            // Subir a Supabase Storage
            const fileExt = 'jpg';
            const fileName = `${userId}/post-images/${Date.now()}-${i}.${fileExt}`;
            
            console.log(`📤 Subiendo imagen ${i + 1}: ${fileName}`);
            
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('post-images')
              .upload(fileName, fileToUpload, {
                cacheControl: '3600',
                upsert: false
              });
            
            if (uploadError) {
              console.error(`❌ Error subiendo imagen ${i + 1}:`, uploadError);
              continue;
            }
            
            // Obtener URL pública
            const { data: { publicUrl } } = supabase.storage
              .from('post-images')
              .getPublicUrl(fileName);
            
            uploadedImageUrls.push(publicUrl);
            console.log(`✅ Imagen ${i + 1} subida exitosamente`);
            
          } else if (typeof image === 'string') {
            // Si ya es una URL permanente, usar directamente
            console.log(`✅ Usando URL existente para imagen ${i + 1}`);
            uploadedImageUrls.push(image);
          } else if (image instanceof File) {
            // Si es un File directamente, procesar y subir
            console.log(`\n🔄 Procesando archivo File ${i + 1}/${images.length}...`);
            console.log(`📊 Tamaño original: ${(image.size / 1024 / 1024).toFixed(2)}MB`);
            console.log(`📝 Tipo: ${image.type}`);
            
            let fileToUpload = image;
            
            // PROCESAR TODAS las imágenes de posts
            if (image.type.startsWith('image/')) {
              console.log(`🔧 Procesando archivo ${i + 1}...`);
              const processedBlob = await compressAndResizeImage(image, COMPRESSION_CONFIG);
              fileToUpload = new File([processedBlob], `post-file-${i}.jpg`, { type: 'image/jpeg' });
              console.log(`✅ Archivo ${i + 1} procesado: ${(fileToUpload.size / 1024 / 1024).toFixed(2)}MB`);
            }
            
            const fileExt = 'jpg';
            const fileName = `${userId}/post-images/${Date.now()}-${i}.${fileExt}`;
            
            console.log(`📤 Subiendo archivo ${i + 1}: ${fileName}`);
            
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('post-images')
              .upload(fileName, fileToUpload, {
                cacheControl: '3600',
                upsert: false
              });
            
            if (uploadError) {
              console.error(`❌ Error subiendo archivo ${i + 1}:`, uploadError);
              continue;
            }
            
            const { data: { publicUrl } } = supabase.storage
              .from('post-images')
              .getPublicUrl(fileName);
            
            uploadedImageUrls.push(publicUrl);
            console.log(`✅ Archivo ${i + 1} subido exitosamente`);
          }
        } catch (imageError) {
          console.error(`❌ Error procesando imagen ${i + 1}:`, imageError);
          // Continuar con las demás imágenes
        }
      }
    }

    console.log('\n📸 Proceso completado:');
    console.log(`   - URLs obtenidas: ${uploadedImageUrls.length}`);
    console.log(`   - Imágenes procesadas: ${uploadedImageUrls.filter(url => !url.includes('blob:')).length}`);
    
    return uploadedImageUrls;

  } catch (error) {
    console.error('❌ Error general en uploadPostImages:', error);
    throw new Error('No se pudieron subir las imágenes: ' + (error as any).message);
  }
};

/**
 * Elimina una imagen de Supabase Storage
 */
export const deleteImage = async (imageUrl: string, bucket: string = 'avatars'): Promise<void> => {
  try {
    // Extraer el nombre del archivo de la URL
    const fileName = imageUrl.split('/').pop();
    if (!fileName) {
      throw new Error('No se pudo extraer el nombre del archivo de la URL');
    }

    console.log(`🗑️ Eliminando imagen: ${fileName} del bucket: ${bucket}`);
    
    const { error } = await supabase.storage
      .from(bucket)
      .remove([fileName]);

    if (error) throw error;

    console.log('✅ Imagen eliminada exitosamente');
  } catch (error) {
    console.error('❌ Error eliminando imagen:', error);
    throw new Error('No se pudo eliminar la imagen: ' + (error as any).message);
  }
};

/**
 * Obtiene información del uso de almacenamiento (útil para monitoreo)
 */
export const getStorageUsage = async (bucket: string): Promise<number> => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list();

    if (error) throw error;

    const totalSize = data?.reduce((acc, file) => acc + (file.metadata?.size || 0), 0) || 0;
    console.log(`💾 Uso de almacenamiento en ${bucket}: ${(totalSize / 1024 / 1024).toFixed(2)}MB`);
    
    return totalSize;
  } catch (error) {
    console.error('Error obteniendo uso de almacenamiento:', error);
    return 0;
  }
};