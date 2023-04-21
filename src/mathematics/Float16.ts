import type FileReader from '../utilities/FileReader.ts';

class Float16 {
    public static fromFile(file: FileReader) {
        file.readUnsignedShortArray(3); // TODO: Save the data for decompilation.
    }
}

export default Float16;
