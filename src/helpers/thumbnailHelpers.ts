import { Context } from '@azure/functions';
import axios from 'axios';
import { Connection } from 'mongoose';
import { IThumbnail } from '../db/schemas/schemaTypes';
import { uploadImage } from '../services/azureStorage';

// const fetchImageUploadThumbnail = async (
//   image_full: string,
//   project_slug: string,
//   token_id: number,
//   context: Context,
// ) => {
//   const response = await axios(image_full, { responseType: 'arraybuffer' });

//   const thumbnail = await sharp(response.data).resize(200).sharpen().toBuffer();

//   const image_thumbnail = await uploadImage(
//     context,
//     thumbnail,
//     project_slug,
//     token_id,
//     'thumbnails',
//   );

//   return image_thumbnail;
// };

// const processThumbnail = async (
//   conn: Connection,
//   existingThumbnails: IThumbnail[],
//   project_slug: string,
//   artblocks_id: string,
//   context: Context,
// ) => {
//   const Thumbnail = conn.model<IThumbnail>('Thumbnail');

//   const doesThumbnailExist = existingThumbnails.find(
//     (thumbnail) => thumbnail.artblocks_id === artblocks_id,
//   );

//   if (doesThumbnailExist) return;

//   const project_id = artblocks_id.length === 8 ? 34 : 181;
//   const token_id = parseInt(artblocks_id.slice(-3));

//   const image_full = `https://artblocks-mainnet.s3.amazonaws.com/${artblocks_id}.png`;

//   const image_thumbnail = await fetchImageUploadThumbnail(
//     image_full,
//     project_slug,
//     token_id,
//     context,
//   );

//   const thumbnail = new Thumbnail({
//     project_slug,
//     project_id,
//     token_id,
//     artblocks_id,
//     image_full,
//     image_thumbnail,
//   });

//   await thumbnail.save();

//   return token_id;
// };

// export const processThumbnails = async (
//   conn: Connection,
//   supply: number,
//   project_slug: string,
//   baseArtBlockId: number,
//   dbThumbnails: IThumbnail[],
//   context: Context,
// ) => {
//   let count = 0;

//   // processes thumbnails in batches of 10
//   const batchSize = 10;
//   for await (const i100 of Array.from({ length: supply / batchSize }, (_, i) => i)) {
//     try {
//       const tokenIdsProcessed = await Promise.all(
//         Array.from({ length: batchSize }, (_, i) => {
//           const i1000 = i100 * batchSize + i;
//           const artblocks_id = `${baseArtBlockId + i1000}`;
//           return processThumbnail(
//             conn,
//             dbThumbnails,
//             project_slug,
//             artblocks_id,
//             context,
//           );
//         }),
//       );

//       count += tokenIdsProcessed.filter(Boolean).length;
//       if (tokenIdsProcessed.filter(Boolean).length) {
//         context.log.info(
//           `${project_slug} thumbnails processed: ${tokenIdsProcessed
//             .map((id) => id)
//             .filter(Boolean)
//             .join(', ')}`,
//         );
//       }
//     } catch (error) {
//       context.log.error(error);
//     }
//   }

//   // check for remainder
//   const remainder = supply % batchSize;
//   // run remainder if it exists
//   if (remainder) {
//     const startFrom = supply - batchSize;
//     const remaining = [...Array(batchSize).keys()].map((i) => i + startFrom);
//     try {
//       const tokenIdsProcessed = await Promise.all(
//         remaining.map((id) => {
//           const artblocks_id = `${baseArtBlockId + id}`;
//           return processThumbnail(
//             conn,
//             dbThumbnails,
//             project_slug,
//             artblocks_id,
//             context,
//           );
//         }),
//       );

//       count += tokenIdsProcessed.filter(Boolean).length;
//       if (tokenIdsProcessed.filter(Boolean).length) {
//         context.log.info(
//           `${project_slug} thumbnails processed: ${tokenIdsProcessed
//             .map((id) => id)
//             .filter(Boolean)
//             .join(', ')}`,
//         );
//       }
//     } catch (error) {
//       context.log.error(error);
//     }
//   }

//   return count;
// };
