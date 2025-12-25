import { NFTStorage, File } from 'nft.storage';
import dotenv from 'dotenv';
dotenv.config();

const NFT_STORAGE_API_KEY = process.env.NFT_STORAGE_API_KEY!;
const client = new NFTStorage({ token: NFT_STORAGE_API_KEY });

export async function uploadFileToIPFSFromMulterFile(multerFile: Express.Multer.File): Promise<string> {
    const file = new File([multerFile.buffer], multerFile.originalname, {
        type: multerFile.mimetype,
    });

    const cid = await client.storeBlob(file);
    return `https://ipfs.io/ipfs/${cid}`;
}
