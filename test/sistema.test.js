const request = require('supertest');
const { expect } = require('chai');
const app = require('../server');
const dbo = require('../db/conn');

describe('Endpoints del Sistema', function() {
  
  before(function(done) {
    this.timeout(10000);
    dbo.connectToServer(function(err) {
      if (err) return done(err);
      done();
    });
  });

  describe('GET /', function() {
    it('debería retornar información del servidor', function(done) {
      request(app)
        .get('/')
        .expect(200)
        .expect('Content-Type', /html/)
        .end(function(err, res) {
          if (err) return done(err);
          expect(res.text).to.include('Bienvenido al Backend');
          done();
        });
    });
  });

  describe('GET /error', function() {
    it('debería retornar endpoint de error', function(done) {
      request(app)
        .get('/error')
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          expect(res.text).to.equal('Error');
          done();
        });
    });
  });

  describe('GET /api-docs', function() {
    it('debería mostrar documentación de Swagger', function(done) {
      request(app)
        .get('/api-docs/')
        .expect(200)
        .end(done);
    });
  });
});