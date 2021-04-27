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
const Prescription = require("../models/Prescription");
const User = require("../models/User");

dotenv.config({ path: "../config/config.env" });

chai.use(chaiHttp);

const patientCookie = process.env.PATIENT_COOKIE
const doctorCookie = process.env.DOCTOR_COOKIE
const roleNotChosenCookie = process.env.ROLE_NOT_CHOSEN_COOKIE

const getAResultId = async () =>  await Result.findOne({}, {_id: 1})
    .then(result => {
      if(result) {
          return result
        }
       else {
        return  {error: true, msg:new Error("No document matches the provided query.")}
      }
    })
    .catch(err => {
      return {error: true, msg:err}
    });
// console.log(res())


const getAUserId = async (query) =>  await User.findOne(query, {googleId: 1})
      .then(result => {
        if(result) {
            return result
          }
          else {
          return  {error: true, msg:new Error("No document matches the provided query.")}
        }
      })
      .catch(err => {
        return {error: true, msg:err}
      });
    

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
            if (err) return(done(err))
            await Result.findByIdAndDelete(res.header.resultid, (error, response) => {
              // console.log(response)
              if (error) return(done(error));
              res.header['location'].should.include(`/result/${res.header.resultid}`)
              return done();
            })
          });
    });
  });

  describe('\nPOST /form as doctor', () => {
    it('it should redirect to /dashboard', (done) => {
      request(server)
          .post('/form')
          // .send({ name: 'Manny', species: 'cat' })
          .send({ 'symptoms': ['1','7','8'] })
          // .send({ 'symptoms': [0] })
          .set('Cookie', `connect.sid=${doctorCookie}`)
          .expect(302)
          .expect('Location', '/dashboard')
          // .expect('page', 'result')
          // .expect('role', 'guest')
          // .expect('Content-Type', /html/)
          .end(async (err, res) => {
            if (err) return(done(err))
            return done();
          });
    });
  });

  describe('\POST /prescription/:resultId as guest', () => {
    it('it should redirect to /', (done) => {
      getAResultId().then(result => {
        // console.log(result)
        if (result.error) return done(result.msg)
        request(server)
            .post(`/prescription/${result.id}`)
            // .send({ name: 'Manny', species: 'cat' })
            .send({ 'prescription': "drink water" })
            // .send({ 'symptoms': [0] })
            // .set('Cookie', `connect.sid=${patientCookie}`)
            .expect(302)
            .expect('Location', '/')
            // .expect('page', 'result')
            // .expect('Content-Type', /html/)
            .end(async (err, res) => {
              // console.log(err)
              if (err) return done(err)
              return done()
            });
      })
    });
  });

  describe('\POST /prescription/:resultId as auth role not chosen', () => {
    it('it should redirect to /role', (done) => {
      getAResultId().then(result => {
        // console.log(result)
        if (result.error) return done(result.msg)
        request(server)
            .post(`/prescription/${result.id}`)
            // .send({ name: 'Manny', species: 'cat' })
            .send({ 'prescription': "drink water" })
            // .send({ 'symptoms': [0] })
            .set('Cookie', `connect.sid=${roleNotChosenCookie}`)
            .expect(302)
            .expect('Location', '/role')
            // .expect('page', 'result')
            // .expect('Content-Type', /html/)
            .end(async (err, res) => {
              // console.log(err)
              if (err) return done(err)
              return done()
            });
      })
    });
  });

  describe('\POST /prescription/:resultId as patient', () => {
    it('it should redirect to /dashboard', (done) => {
      getAResultId().then(result => {
        // console.log(result)
        if (result.error) return done(result.msg)
        request(server)
            .post(`/prescription/${result.id}`)
            // .send({ name: 'Manny', species: 'cat' })
            .send({ 'prescription': "drink water" })
            // .send({ 'symptoms': [0] })
            .set('Cookie', `connect.sid=${patientCookie}`)
            .expect(302)
            .expect('Location', '/dashboard')
            // .expect('page', 'result')
            // .expect('Content-Type', /html/)
            .end(async (err, res) => {
              // console.log(err)
              if (err) return done(err)
              return done()
            });
      })
    });
  });


  describe('\POST /prescription/:resultId as doctor', () => {
    it('it should store the prescription in database and redirect to /result/:resultId', (done) => {
      getAResultId().then(result => {
        // console.log(result)
        if (result.error) return done(result.msg)
        request(server)
            .post(`/prescription/${result.id}`)
            // .send({ name: 'Manny', species: 'cat' })
            .send({ 'prescription': "drink water" })
            // .send({ 'symptoms': [0] })
            .set('Cookie', `connect.sid=${doctorCookie}`)
            .expect(302)
            .expect('Location', `/result/${result.id}`)
            // .expect('page', 'result')
            // .expect('Content-Type', /html/)
            .end(async (err, res) => {
              // console.log(err)
              if (err) return done(err)
              // console.log(res.header)
              await Prescription.findByIdAndDelete(res.header.prescriptionid, (error, response) => {
                // console.log(response)
                if (error) return(done(err));
                return done();
              })
            });
      })
    });
  });

  describe('\GET /result/:id as guest', () => {
    it('it should redirect to /', (done) => {
      getAResultId().then(result => {
        // console.log(result)
        if (result.error) return done(result.msg)
        request(server)
            .get(`/result/${result.id}`)
            // .send({ name: 'Manny', species: 'cat' })
            // .send({ 'symptoms': ['1','7','8'] })
            // .send({ 'symptoms': [0] })
            // .set('Cookie', `connect.sid=${patientCookie}`)
            .expect(302)
            .expect('Location', '/')
            // .expect('page', 'result')
            // .expect('Content-Type', /html/)
            .end(async (err, res) => {
              // console.log(err)
              if (err) return done(err)
              return done()
            });
      })
    });
  });

  describe('\GET /result/:id as auth role not chosen', () => {
    it('it should redirect to /role', (done) => {
      getAResultId().then(result => {
        // console.log(result)
        if (result.error) return done(result.msg)
        request(server)
            .get(`/result/${result.id}`)
            // .send({ name: 'Manny', species: 'cat' })
            // .send({ 'symptoms': ['1','7','8'] })
            // .send({ 'symptoms': [0] })
            .set('Cookie', `connect.sid=${roleNotChosenCookie}`)
            .expect(302)
            .expect('Location', '/role')
            // .expect('page', 'result')
            // .expect('Content-Type', /html/)
            .end(async (err, res) => {
              // console.log(err)
              if (err) return done(err)
              return done()
            });
      })
    });
  });

  describe('\GET /result/:id as patient', () => {
    it('it should redirect to /', (done) => {
      getAResultId().then(result => {
        // console.log(result)
        if (result.error) return done(result.msg)
        request(server)
            .get(`/result/${result.id}`)
            // .send({ name: 'Manny', species: 'cat' })
            // .send({ 'symptoms': ['1','7','8'] })
            // .send({ 'symptoms': [0] })
            .set('Cookie', `connect.sid=${patientCookie}`)
            // .expect(302)
            // .expect('Location', '/')
            .expect('page', 'result')
            .expect('Content-Type', /html/)
            .end(async (err, res) => {
              // console.log(err)
              if (err) return done(err)
              return done()
            });
      })
    });
  });

  describe('\GET /result/:id as doctor', () => {
    it('it should redirect to /', (done) => {
      getAResultId().then(result => {
        // console.log(result)
        if (result.error) return done(result.msg)
        request(server)
            .get(`/result/${result.id}`)
            // .send({ name: 'Manny', species: 'cat' })
            // .send({ 'symptoms': ['1','7','8'] })
            // .send({ 'symptoms': [0] })
            .set('Cookie', `connect.sid=${doctorCookie}`)
            // .expect(302)
            // .expect('Location', '/')
            .expect('page', 'result')
            .expect('Content-Type', /html/)
            .end(async (err, res) => {
              // console.log(err)
              if (err) return done(err)
              return done()
            });
      })
    });
  });

  describe('\GET /user/patient as guest', () => {
    it('it should redirect to /form', (done) => {
      request(server)
          .get(`/user/patient`)
          // .send({ name: 'Manny', species: 'cat' })
          // .send({ 'symptoms': ['1','7','8'] })
          // .send({ 'symptoms': [0] })
          // .set('Cookie', `connect.sid=${patientCookie}`)
          .expect(302)
          .expect('Location', '/')
          // .expect('page', 'result')
          // .expect('Content-Type', /html/)
          .end(async (err, res) => {
            // console.log(err)
            if (err) return done(err)
            return done()
          });
    });
  });

  describe('\GET /user/patient as auth role not chosen', () => {
    it('it should redirect to /role', (done) => {
      request(server)
          .get(`/user/patient`)
          // .send({ name: 'Manny', species: 'cat' })
          // .send({ 'symptoms': ['1','7','8'] })
          // .send({ 'symptoms': [0] })
          .set('Cookie', `connect.sid=${roleNotChosenCookie}`)
          .expect(302)
          .expect('Location', '/role')
          // .expect('page', 'result')
          // .expect('Content-Type', /html/)
          .end(async (err, res) => {
            // console.log(err)
            if (err) return done(err)
            return done()
          });
    });
  });

  describe('\GET /user/patient as patient', () => {
    it('it should redirect to /dashboard', (done) => {
      request(server)
          .get(`/user/patient`)
          // .send({ name: 'Manny', species: 'cat' })
          // .send({ 'symptoms': ['1','7','8'] })
          // .send({ 'symptoms': [0] })
          .set('Cookie', `connect.sid=${patientCookie}`)
          .expect(302)
          .expect('Location', '/dashboard')
          // .expect('page', 'result')
          // .expect('Content-Type', /html/)
          .end(async (err, res) => {
            // console.log(err)
            if (err) return done(err)
            return done()
          });
    });
  });

  describe('\GET /user/patient as doctor', () => {
    it('it should fetch and render all patients', (done) => {
      request(server)
          .get(`/user/patient`)
          // .send({ name: 'Manny', species: 'cat' })
          // .send({ 'symptoms': ['1','7','8'] })
          // .send({ 'symptoms': [0] })
          .set('Cookie', `connect.sid=${doctorCookie}`)
          // .expect(302)
          // .expect('Location', '/dashboard')
          .expect('page', 'user')
          .expect('role', 'doctor')
          .expect('Content-Type', /html/)
          .end(async (err, res) => {
            // console.log(err)
            if (err) return done(err)
            return done()
          });
    });
  });

  describe('\GET /user/doctor as guest', () => {
    it('it should redirect to /form', (done) => {
      request(server)
          .get(`/user/doctor`)
          // .send({ name: 'Manny', species: 'cat' })
          // .send({ 'symptoms': ['1','7','8'] })
          // .send({ 'symptoms': [0] })
          // .set('Cookie', `connect.sid=${doctorCookie}`)
          .expect(302)
          .expect('Location', '/')
          // .expect('page', 'result')
          // .expect('Content-Type', /html/)
          .end(async (err, res) => {
            // console.log(err)
            if (err) return done(err)
            return done()
          });
    });
  });

  describe('\GET /user/doctor as auth role not chosen', () => {
    it('it should redirect to /role', (done) => {
      request(server)
          .get(`/user/doctor`)
          // .send({ name: 'Manny', species: 'cat' })
          // .send({ 'symptoms': ['1','7','8'] })
          // .send({ 'symptoms': [0] })
          .set('Cookie', `connect.sid=${roleNotChosenCookie}`)
          .expect(302)
          .expect('Location', '/role')
          // .expect('page', 'result')
          // .expect('Content-Type', /html/)
          .end(async (err, res) => {
            // console.log(err)
            if (err) return done(err)
            return done()
          });
    });
  });

  describe('\GET /user/doctor as patient', () => {
    it('it should fetch and render all doctors', (done) => {
      request(server)
          .get(`/user/doctor`)
          // .send({ name: 'Manny', species: 'cat' })
          // .send({ 'symptoms': ['1','7','8'] })
          // .send({ 'symptoms': [0] })
          .set('Cookie', `connect.sid=${patientCookie}`)
          // .expect(302)
          // .expect('Location', '/role')
          .expect('page', 'user')
          .expect('role', 'patient')
          .expect('Content-Type', /html/)
          .end(async (err, res) => {
            // console.log(err)
            if (err) return done(err)
            return done()
          });
    });
  });

  describe('\GET /user/doctor as doctor', () => {
    it('it should fetch and render all doctors', (done) => {
      request(server)
          .get(`/user/doctor`)
          // .send({ name: 'Manny', species: 'cat' })
          // .send({ 'symptoms': ['1','7','8'] })
          // .send({ 'symptoms': [0] })
          .set('Cookie', `connect.sid=${doctorCookie}`)
          // .expect(302)
          // .expect('Location', '/role')
          .expect('page', 'user')
          .expect('role', 'doctor')
          .expect('Content-Type', /html/)
          .end(async (err, res) => {
            // console.log(err)
            if (err) return done(err)
            return done()
          });
    });
  });

  describe('\GET /user/:gid as guest', () => {
    it('it should redirect to /', (done) => {
      getAUserId().then(result => {
        // console.log(result)
        if (result.error) return done(result.msg)
        request(server)
            .get(`/user/${result.googleId}`)
            // .send({ name: 'Manny', species: 'cat' })
            // .send({ 'symptoms': ['1','7','8'] })
            // .send({ 'symptoms': [0] })
            // .set('Cookie', `connect.sid=${patientCookie}`)
            .expect(302)
            .expect('Location', '/')
            // .expect('page', 'result')
            // .expect('Content-Type', /html/)
            .end(async (err, res) => {
              // console.log(err)
              if (err) return done(err)
              return done()
            });
      })
    });
  });

  describe('\GET /user/:gid as auth role not chosen', () => {
    it('it should redirect to /role', (done) => {
      getAUserId().then(result => {
        // console.log(result)
        if (result.error) return done(result.msg)
        request(server)
            .get(`/user/${result.googleId}`)
            // .send({ name: 'Manny', species: 'cat' })
            // .send({ 'symptoms': ['1','7','8'] })
            // .send({ 'symptoms': [0] })
            .set('Cookie', `connect.sid=${roleNotChosenCookie}`)
            .expect(302)
            .expect('Location', '/role')
            // .expect('page', 'result')
            // .expect('Content-Type', /html/)
            .end(async (err, res) => {
              // console.log(err)
              if (err) return done(err)
              return done()
            });
      })
    });
  });

  describe('\GET /user/:gid of a patient as a patient', () => {
    it('it should redirect to dashboard', (done) => {
      getAUserId({'role':'patient'}).then(result => {
        // console.log(result)
        if (result.error) return done(result.msg)
        request(server)
            .get(`/user/${result.googleId}`)
            // .send({ name: 'Manny', species: 'cat' })
            // .send({ 'symptoms': ['1','7','8'] })
            // .send({ 'symptoms': [0] })
            .set('Cookie', `connect.sid=${patientCookie}`)
            .expect(302)
            .expect('Location', '/dashboard')
            // .expect('page', 'user')
            // .expect('role', 'doctor')
            // .expect('Content-Type', /html/)
            .end(async (err, res) => {
              // console.log(err)
              if (err) return done(err)
              return done()
            });
      })
    });
  });


  describe('\GET /user/:gid of a doctor as a patient', () => {
    it('it should fetch profile and render doctor', (done) => {
      getAUserId({'role':'doctor'}).then(result => {
        // console.log(result)
        if (result.error) return done(result.msg)
        request(server)
            .get(`/user/${result.googleId}`)
            // .send({ name: 'Manny', species: 'cat' })
            // .send({ 'symptoms': ['1','7','8'] })
            // .send({ 'symptoms': [0] })
            .set('Cookie', `connect.sid=${patientCookie}`)
            // .expect(302)
            // .expect('Location', '/')
            .expect('page', 'user')
            .expect('role', 'doctor')
            .expect('Content-Type', /html/)
            .end(async (err, res) => {
              // console.log(err)
              if (err) return done(err)
              return done()
            });
      })
    });
  });

  describe('\GET /user/:gid as doctor', () => {
    it('it should fetch and render profile', (done) => {
      getAUserId().then(result => {
        // console.log(result)
        if (result.error) return done(result.msg)
        request(server)
            .get(`/user/${result.googleId}`)
            // .send({ name: 'Manny', species: 'cat' })
            // .send({ 'symptoms': ['1','7','8'] })
            // .send({ 'symptoms': [0] })
            .set('Cookie', `connect.sid=${doctorCookie}`)
            // .expect(302)
            // .expect('Location', '/')
            .expect('page', 'user')
            .expect('Content-Type', /html/)
            .end(async (err, res) => {
              // console.log(err)
              if (err) return done(err)
              return done()
            });
      })
    });
  });




});



