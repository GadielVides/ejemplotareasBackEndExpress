const request = require('supertest');
const { expect } = require('chai');
const app = require('../server');
const dbo = require('../db/conn');

describe('API de Tareas', function() {
  let createdTaskId;

  // Conectar a DB antes de las pruebas
  before(function(done) {
    this.timeout(10000);
    dbo.connectToServer(function(err) {
      if (err) return done(err);
      done();
    });
  });

  describe('GET /tareas', function() {
    it('debería obtener todas las tareas', function(done) {
      request(app)
        .get('/tareas')
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) return done(err);
          expect(res.body).to.be.an('array');
          done();
        });
    });
  });

  describe('POST /tareas', function() {
    it('debería crear una nueva tarea', function(done) {
      const nuevaTarea = {
        nombre: 'Tarea de prueba',
        hecho: false
      };

      request(app)
        .post('/tareas')
        .send(nuevaTarea)
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) return done(err);
          expect(res.body).to.have.property('id');
          createdTaskId = res.body.id;
          done();
        });
    });

    it('debería fallar sin datos requeridos', function(done) {
      request(app)
        .post('/tareas')
        .send({}) // Sin datos
        .expect(400)
        .end(done);
    });
  });

  describe('PUT /tareas/:id', function() {
    it('debería actualizar una tarea existente', function(done) {
      if (!createdTaskId) {
        return done(new Error('No hay tarea creada para actualizar'));
      }

      const tareaActualizada = {
        nombre: 'Tarea actualizada',
        hecho: true
      };

      request(app)
        .put(`/tareas/${createdTaskId}`)
        .send(tareaActualizada)
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) return done(err);
          expect(res.body).to.have.property('message');
          expect(res.body.message).to.include('actualizada');
          done();
        });
    });

    it('debería fallar con ID inválido', function(done) {
      request(app)
        .put('/tareas/invalid-id')
        .send({ nombre: 'Test', hecho: false })
        .expect(400)
        .end(done);
    });
  });

  describe('DELETE /tareas/delete/:id', function() {
    it('debería eliminar una tarea', function(done) {
      if (!createdTaskId) {
        return done(new Error('No hay tarea creada para eliminar'));
      }

      request(app)
        .delete(`/tareas/delete/${createdTaskId}`)
        .expect(204)
        .end(done);
    });
  });
});