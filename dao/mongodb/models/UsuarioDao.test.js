const path = require('path');
const dotenv = require('dotenv');
const CategoriaDao = require('./UsuarioDao');

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const Connection = require('../Connection');
const { hasUncaughtExceptionCaptureCallback } = require('process');

describe("Testing Usuario Crud in MongoDB", () => {
  const env = process.env;
  let db, CatDao, Cat, id;
  beforeAll(async () => {
    jest.resetModules();
    process.env = {
      ...env,
      MONGODB_URI: "mongodb+srv://lizzialnz:seminariotaller@mi-cluster1.65cl4kc.mongodb.net/test",
      MONGODB_DB: "SW2022",
      MONGODB_SETUP: 1,
    };
    db = await Connection.getDB();
    CatDao = new CategoriaDao(db,'Usuarios');
    await CatDao.init();
    return true;
  });
  afterAll(async()=>{
    process.env = env;
    return true;
  });
  test('Get All Records', async ()=>{
    const result = await CatDao.getAll();
    console.log(result);
  });
  test('Insert One Record', async ()=>{
    const result = await CatDao.insertOne({ email:'Lizzi Silva',nombre:'Lizzi Silva',avatar:'Lizzi Silva',password:'Lizzi Silva', estado:'ACT'});
    console.log(result);
    id = result.insertedId;
    expect(result.acknowledged).toBe(true);
  });
  test('FindById Record', async ()=>{
    const record = await CatDao.getById({codigo:id.toString()});
    console.log(record);
    expect(record._id).toStrictEqual(id);
  });
  test('Update One Record', async ()=>{
    const updateResult = await CatDao.updateOne({codigo:id.toString(), email:'Lizzi Alonzo',nombre:'Lizzi Alonzo',avatar:'Lizzi Alonzo',password:'Lizzi Alonzo', estado:'INA'});
    console.log(updateResult);
    expect(updateResult.acknowledged).toBe(true);
  });
  test('Delete One Record', async () => {
    const deleteResult = await CatDao.deleteOne({ codigo: id.toString() });
    console.log(deleteResult);
    expect(deleteResult.acknowledged).toBe(true);
  });
});
