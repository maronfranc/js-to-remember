// import fs from "fs";
const fs = require("fs");

// interface IPath {
//     readFrom: string;
// }

const ARGS = process.argv.slice(2);
const READ_FOLDER_PATH = ARGS[0];
const foldersToRead/*: IPath[]*/ = [];

// export type Callback = (path: IPath, fileOrFolderName: string) => void;

const recursiveReadFilesInFolder = (readFolderPath, callback) => {
    if (readFolderPath.readFrom === undefined) {
        throw new Error("Diretório para a pasta não informado");
    }

    if (!fs.existsSync(readFolderPath.readFrom)) {
        throw new Error("Pasta informada não existe");
    }

    const files = fs.readdirSync(readFolderPath.readFrom);

    for (const fileOrFolder of files) {
        const stat = fs.statSync(`${readFolderPath.readFrom}/${fileOrFolder}`);
        if (stat.isDirectory()) {
            foldersToRead.push({
                readFrom: `${readFolderPath.readFrom}/${fileOrFolder}`
            });
        } else {
            callback({
                readFrom: `${readFolderPath.readFrom}/${fileOrFolder}`
            }, fileOrFolder);
        }
    }

    if (foldersToRead.length > 0) {
        const folderPaths = foldersToRead.pop();

        if (folderPaths !== undefined) {
            recursiveReadFilesInFolder(folderPaths, callback);
        }
    }
}

const getIds = (path, name) => {
    console.log(path);
    console.log(name);
}

recursiveReadFilesInFolder({
    readFrom: READ_FOLDER_PATH
}, getIds);
