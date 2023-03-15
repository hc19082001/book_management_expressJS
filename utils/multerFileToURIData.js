const DatauriParser = require("datauri/parser");
const parser = new DatauriParser();

const multerFileToURIData = (MulterFile) => parser.format(MulterFile.mimetype, MulterFile.buffer).content;

module.exports = multerFileToURIData;
