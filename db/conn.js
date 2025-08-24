const { MongoClient } = require('mongodb');

//Cargar variables según el entorno
if(process.env.NODE_ENV === 'test'){
  require('dotenv').config({ path: './.env.test'});
} else {
  require('dotenv').config({ path: './config.env'});
}

const connectionString = process.env.ATLAS_URI;
const mongoURL = process.env.MONGO_URL || connectionString

const client = new MongoClient(mongoURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let dbConnection;

module.exports = {
  connectToServer: function (callback) {
    client.connect(function (err, db) {
      if (err || !db) {
        return callback(err);
      }

      dbConnection = db.db('ejemplo');
      console.log('Successfully connected to MongoDB.');

      return callback();
    });
  },

  getDb: function () {
    return dbConnection;
  },
};
