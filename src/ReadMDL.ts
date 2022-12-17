import type FileReader from './FileReader';
import ReadAnimationDescription from './MDLReaders/ReadAnimationDescription';
import ReadAttachment from './MDLReaders/ReadAttachment';
import ReadBodyParts from './MDLReaders/ReadBodyParts';
import ReadBone from './MDLReaders/ReadBone';
import ReadBoneController from './MDLReaders/ReadBoneController';
import ReadFlexController from './MDLReaders/ReadFlexController';
import ReadFlexControllerUI from './MDLReaders/ReadFlexControllerUI';
import ReadFlexDescription from './MDLReaders/ReadFlexDescription';
import ReadHeader from './MDLReaders/ReadHeader';
import ReadHeader2 from './MDLReaders/ReadHeader2';
import ReadHitboxSet from './MDLReaders/ReadHitboxSet';

class ReadMDL {
    public readonly header: ReadHeader;
    public readonly header2: ReadHeader2;
    public readonly bones: ReadBone[] = [];
    public readonly boneControllers: ReadBoneController[] = [];
    public readonly localAttachments: ReadAttachment[] = [];
    public readonly hitboxSets: ReadHitboxSet[] = [];
    public readonly boneTableByName: number[];
    public readonly localAnimations: ReadAnimationDescription[] = [];
    public readonly bodyParts: ReadBodyParts[] = [];
    public readonly flexDescriptions: ReadFlexDescription[] = [];
    public readonly flexControllers: ReadFlexController[] = [];
    public readonly flexControllerUIs: ReadFlexControllerUI[] = [];

    public constructor(file: FileReader) {
        const fileSize = file.readableBytes.length;
        console.log('MDL File size: %d', fileSize);
        this.header = new ReadHeader(file);

        // From looking at the source code, header2 may be optional.
        this.header2 = new ReadHeader2(file);

        for (let boneReader = 0; boneReader < this.header.numbones; boneReader++) {
            file.setOffset(this.header.boneindex + boneReader * 216);
            this.bones.push(new ReadBone(file)); // Done
        }

        for (let boneControllerReader = 0; boneControllerReader < this.header.numbonecontrollers; boneControllerReader++) {
            file.setOffset(this.header.bonecontrollerindex + boneControllerReader * 56);
            this.boneControllers.push(new ReadBoneController(file)); // Done
        }

        for (let localAttachmentReader = 0; localAttachmentReader < this.header.numlocalattachments; localAttachmentReader++) {
            file.setOffset(this.header.localattachmentindex + localAttachmentReader * 92);
            this.localAttachments.push(new ReadAttachment(file)); // Done
        }

        for (let hitboxSetReader = 0; hitboxSetReader < this.header.numhitboxsets; hitboxSetReader++) {
            file.setOffset(this.header.hitboxsetindex + hitboxSetReader * 12);
            this.hitboxSets.push(new ReadHitboxSet(file)); // Done
        }

        file.setOffset(this.header.bonetablebynameindex);
        this.boneTableByName = file.readByteArray(this.header.numbones); // This is not reading all the bytes

        for (let localAnimationReader = 0; localAnimationReader < this.header.numlocalanim; localAnimationReader++) {
            file.setOffset(this.header.localanimindex + localAnimationReader * 100);
            this.localAnimations.push(new ReadAnimationDescription(file)); // Not Done
        }

        console.log('MDL Read Bytes: %d', file.readByteCount + 3);

        // TODO: Add sequence reader

        // TODO: Add nodes reader

        file.setOffset(this.header.bodypartindex);
        for (let bodyPartReader = 0; bodyPartReader < this.header.numbodyparts; bodyPartReader++) {
            this.bodyParts.push(new ReadBodyParts(file)); // Not Done
        }

        file.setOffset(this.header.flexdescindex);
        for (let flexDescriptionReader = 0; flexDescriptionReader < this.header.numflexdesc; flexDescriptionReader++) {
            this.flexDescriptions.push(new ReadFlexDescription(file)); // Done
        }

        file.setOffset(this.header.flexcontrollerindex);
        for (let flexControllerReader = 0; flexControllerReader < this.header.numflexcontrollers; flexControllerReader++) {
            this.flexControllers.push(new ReadFlexController(file)); // Done
        }

        file.setOffset(this.header.flexcontrolleruiindex);
        for (let flexControllerUIReader = 0; flexControllerUIReader < this.header.numflexcontrollerui; flexControllerUIReader++) {
            this.flexControllerUIs.push(new ReadFlexControllerUI(file)); // Done
        }

        console.log('MDL Read Bytes: %d, %d unread bytes', file.readByteCount, fileSize - file.readByteCount);
    }

    public toJSON(): string {
        return JSON.stringify({
            Header: this.header,
            Bones: this.bones,
            // 'Local Animations': this.localAnimations,
        });
    }
}

export default ReadMDL;