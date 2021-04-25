let mongoose = require("mongoose");

//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app');
let should = chai.should();
let request = require("supertest")
const dotenv = require("dotenv");
const chalk = require ('chalk');
const Result = require("../models/Result");
const { findById } = require("../models/Result");

dotenv.config({ path: "../config/config.env" });

chai.use(chaiHttp);

const patientCookie = process.env.PATIENT_COOKIE
const doctorCookie = process.env.DOCTOR_COOKIE
const roleNotChosenCookie = process.env.ROLE_NOT_CHOSEN_COOKIE

describe('index', () => {
  
  describe(chalk.hex('#ffffff')('\nGET / as guest'), () => {
      it('it should redirect to /form', (done) => {
        request(server)
            .get('/')
            .expect(302)
            .expect('Location', '/form')
            .end((err, res) => {
              if (err) return(done(err))
              return done();
            });
      });
  });

  describe('\nGET / as auth role not chosen', () => {
    it('it should redirect to /role', (done) => {
      request(server)
          .get('/')
          .set('Cookie', `connect.sid=${roleNotChosenCookie}`)
          .expect(302)
          .expect('Location', '/role')
          .end((err, res) => {
            // console.log(res)
            // res.header['location'].should.include(res.redirectPath)
            if (err) return(done(err))
            return done();
          });
    });
  });

  describe('\nGET / as patient', () => {
    it('it should redirect to /dashboard', (done) => {
      request(server)
          .get('/')
          .set('Cookie', `connect.sid=${patientCookie}`)
          .expect(302)
          .expect('Location', '/dashboard')
          .end((err, res) => {
            // console.log(res)
            // res.header['location'].should.include(res.redirectPath)
            if (err) return(done(err))
            return done();
          });
    });
  });

  describe('\nGET / as doctor', () => {
    it('it should redirect to /dashboard', (done) => {
      request(server)
          .get('/')
          .set('Cookie', `connect.sid=${doctorCookie}`)
          .expect(302)
          .expect('Location', '/dashboard')
          .end((err, res) => {
            // console.log(res)
            // res.header['location'].should.include(res.redirectPath)
            if (err) return(done(err))
            return done();
          });
    });
  });

  describe('\nGET /dashboard as guest', () => {
    it('it should redirect to /', (done) => {
      request(server)
          .get('/dashboard')
          .expect(302)
          .expect('Location', '/')
          // .set('Cookie', `connect.sid=${patientCookie}`)
          // .expect('Content-Type', /html/)
          // .expect('role', 'patient')
          // .expect(200)
          .end((err, res) => {
            if (err) return(done(err))
            return done();
          });
    });
  });

  describe('\nGET /dashboard as auth role not chosen', () => {
    it('it should redirect to /role', (done) => {
      request(server)
          .get('/dashboard')
          .set('Cookie', `connect.sid=${roleNotChosenCookie}`)
          .expect(302)
          .expect('Location', '/role')
          .end((err, res) => {
            // console.log(res)
            // res.header['location'].should.include(res.redirectPath)
            if (err) return(done(err))
            return done();
          });
    });
  });

  describe('\nGET /dashboard as patient', () => {
    it('it should render dashboard of patient', (done) => {
      request(server)
          .get('/dashboard')
          .set('Cookie', `connect.sid=${patientCookie}`)
          .expect(200)
          .expect('page', 'dashboard')
          .expect('role', 'patient')
          .expect('Content-Type', /html/)
          .end((err, res) => {
            if (err) return(done(err))
            return done();
          });
    });
  });

  describe('\nGET /dashboard as doctor', () => {
    it('it should render dashboard of doctor', (done) => {
      request(server)
          .get('/dashboard')
          .set('Cookie', `connect.sid=${doctorCookie}`)
          .expect(200)
          .expect('page', 'dashboard')
          .expect('role', 'doctor')
          .expect('Content-Type', /html/)
          .end((err, res) => {
            if (err) return(done(err))
            return done();
          });
    });
  });

  describe('\nGET /role as guest', () => {
    it('it should redirect to /', (done) => {
      request(server)
          .get('/role')
          // .set('Cookie', `connect.sid=${doctorCookie}`)
          // .expect('Content-Type', /html/)
          // .expect('role', 'doctor')
          .expect(302)
          .expect('Location', '/')
          .end((err, res) => {
            if (err) return(done(err))
            return done();
          });
    });
  });

  describe('\nGET /role as auth role not chosen', () => {
    it('it should render role', (done) => {
      request(server)
          .get('/role')
          .set('Cookie', `connect.sid=${roleNotChosenCookie}`)
          // .expect('role', 'doctor')
          // .expect('Location', '/')
          .expect(200)
          .expect('page', 'role')
          .expect('Content-Type', /html/)
          .end((err, res) => {
            if (err) return(done(err))
            return done();
          });
    });
  });

  describe('\nGET /role as patient', () => {
    it('it should redirect to /dashboard', (done) => {
      request(server)
          .get('/role')
          .set('Cookie', `connect.sid=${patientCookie}`)
          // .expect('Content-Type', /html/)
          // .expect('role', 'doctor')
          .expect(302)
          .expect('Location', '/dashboard')
          .end((err, res) => {
            if (err) return(done(err))
            return done();
          });
    });
  });

  describe('\nGET /role as doctor', () => {
    it('it should redirect to /dashboard', (done) => {
      request(server)
          .get('/role')
          .set('Cookie', `connect.sid=${doctorCookie}`)
          // .expect('Content-Type', /html/)
          // .expect('role', 'doctor')
          .expect(302)
          .expect('Location', '/dashboard')
          .end((err, res) => {
            if (err) return(done(err))
            return done();
          });
    });
  });

  describe('\nGET /form as guest', () => {
    it('it should render form', (done) => {
      request(server)
          .get('/form')
          // .set('Cookie', `connect.sid=${doctorCookie}`)
          .expect(200)
          .expect('page', 'form')
          .expect('role', 'guest')
          // .expect('role', 'doctor')
          .expect('Content-Type', /html/)
          .end((err, res) => {
            if (err) return(done(err))
            return done();
          });
    });
  });

  describe('\nGET /form as auth role not chosen', () => {
    it('it should redirect to /role', (done) => {
      request(server)
          .get('/form')
          .set('Cookie', `connect.sid=${roleNotChosenCookie}`)
          .expect(302)
          .expect('Location', '/role')
          // .expect('page', 'form')
          // .expect('role', 'doctor')
          // .expect('Content-Type', /html/)
          .end((err, res) => {
            if (err) return(done(err))
            return done();
          });
    });
  });

  describe('\nGET /form as patient', () => {
    it('it should render form', (done) => {
      request(server)
          .get('/form')
          .set('Cookie', `connect.sid=${patientCookie}`)
          .expect(200)
          // .expect('Location', '/role')
          .expect('page', 'form')
          .expect('role', 'patient')
          // .expect('role', 'doctor')
          .expect('Content-Type', /html/)
          .end((err, res) => {
            if (err) return(done(err))
            return done();
          });
    });
  });

  describe('\nGET /form as doctor', () => {
    it('it should redirect to /dashboard', (done) => {
      request(server)
          .get('/form')
          .set('Cookie', `connect.sid=${doctorCookie}`)
          .expect(302)
          .expect('Location', '/dashboard')
          // .expect('page', 'form')
          // .expect('role', 'doctor')
          // .expect('Content-Type', /html/)
          .end((err, res) => {
            if (err) return(done(err))
            return done();
          });
    });
  });

  describe('\nPOST /form as guest', () => {
    it('it should render result', (done) => {
      request(server)
          .post('/form')
          // .send({ name: 'Manny', species: 'cat' })
          .send({ 'symptoms': ['1','7','8'] })
          // .send({ 'symptoms': [0] })
          // .set('Cookie', `connect.sid=${doctorCookie}`)
          .expect(200)
          // .expect('Location', '/dashboard')
          .expect('page', 'result')
          .expect('role', 'guest')
          .expect('Content-Type', /html/)
          .end((err, res) => {
            // console.log(res)
            if (err) return(done(err))
            return done();
          });
    });
  });

  describe('\nPOST /form as auth role not chosen', () => {
    it('it should redirect to /role', (done) => {
      request(server)
          .post('/form')
          // .send({ name: 'Manny', species: 'cat' })
          .send({ 'symptoms': ['1','7','8'] })
          // .send({ 'symptoms': [0] })
          .set('Cookie', `connect.sid=${roleNotChosenCookie}`)
          .expect(302)
          .expect('Location', '/role')
          // .expect('page', 'result')
          // .expect('role', 'guest')
          // .expect('Content-Type', /html/)
          .end((err, res) => {
            // console.log(res)
            if (err) return(done(err))
            return done();
          });
    });
  });

  describe('\nPOST /form as patient', () => {
    it('it should store the result in database and redirect to /result/:id', (done) => {
      request(server)
          .post('/form')
          // .send({ name: 'Manny', species: 'cat' })
          .send({ 'symptoms': ['1','7','8'] })
          // .send({ 'symptoms': [0] })
          .set('Cookie', `connect.sid=${patientCookie}`)
          .expect(302)
          // .expect('page', 'result')
          // .expect('role', 'guest')
          // .expect('Content-Type', /html/)
          .end(async (err, res) => {
            // console.log(res)
            // res
            await Result.findByIdAndDelete(res.header.resultid, (err, response) => {
              // console.log(response)
              if (err) return(done(err));
              res.header['location'].should.include(`/result/${res.header.resultid}`)
              if (err) return(done(err))
              return done();
            })
            if (err) return(done(err))
            return done();
          });
    });
  });

});
