'use strict';

var chai = require('chai');
var expect = chai.expect;
var mockery = require('mockery');
var sinon = require('sinon');

var testSubject;

describe('ApiMethodCommand', function () {
    var createMethodStub;
    var deleteMethodStub;
    var getForResponseStub;
    var getParametersStub;

    var getStub;
    var putStub;
    var deleteStub;

    after(function () {
        mockery.deregisterAll();
        mockery.disable();
    });
    before(function() {
        mockery.enable({
            useCleanCache: true,
            warnOnUnregistered: false
        });

        createMethodStub = sinon.stub();
        deleteMethodStub = sinon.stub();
        getForResponseStub = sinon.stub();
        getParametersStub = sinon.stub();

        getStub = sinon.stub();
        putStub = sinon.stub();
        deleteStub = sinon.stub();

        var apiMethodServiceStub = {
            createMethod: createMethodStub,
            deleteMethod: deleteMethodStub,
            getForResponse: getForResponseStub
        };
        var apiMethodEventStub = {
            getParameters: getParametersStub
        };
        var cloudFormationTrackerStub = {
            put: putStub,
            get: getStub,
            delete: deleteStub
        };

        mockery.registerMock('../service/ApiMethod/ApiMethodService', apiMethodServiceStub);
        mockery.registerMock('../service/ApiMethod/ApiMethodEvent', apiMethodEventStub);
        mockery.registerMock('../service/CloudFormationResourceTracker', cloudFormationTrackerStub);

        testSubject = require('../../../lib/commands/ApiMethod');
    });
    beforeEach(function () {
        createMethodStub.reset().resetBehavior();
        createMethodStub.yields(undefined);
        deleteMethodStub.reset().resetBehavior();
        deleteMethodStub.yields(undefined);
        getForResponseStub.reset().resetBehavior();
        getForResponseStub.yields(undefined, {});
        getParametersStub.reset().resetBehavior();
        getParametersStub.returns({ params: {} });


        getStub.reset().resetBehavior();
        getStub.yields(undefined, {});
        putStub.reset().resetBehavior();
        putStub.yields(undefined, {});
        deleteStub.reset().resetBehavior();
        deleteStub.yields(undefined, {});
    });

    describe('getParameters', function () {
        it('should get parameters', function (done) {
            var parameters = testSubject.getParameters();
            expect(parameters.params).to.be.an('object');
            done();
        });
        it('should get error', function (done) {
            getParametersStub.returns(new Error());
            var parameters = testSubject.getParameters();
            expect(parameters.params).to.be.an.Error;
            done();
        });
    });

    describe('createResource', function () {
        it('should create resource', function (done) {
            testSubject.createResource({}, {}, { params: {method: {}} }, function (error) {
                expect(error).to.be.undefined;
                expect(putStub.called).to.be.true;
                done();
            });
        });
        it('should fail create resource', function (done) {
            createMethodStub.yields('createError');
            testSubject.createResource({}, {}, { params: {method: {}} }, function (error) {
                expect(error).to.equal('createError');
                expect(createMethodStub.called).to.be.true;
                expect(putStub.called).to.be.false;
                expect(getForResponseStub.called).to.be.false;
                done();
            });
        });
        it('should fail if get for response fails', function (done) {
            getForResponseStub.yields('getForResponseError');
            testSubject.createResource({}, {}, { params: {method: {}} }, function (error) {
                expect(error).to.equal('getForResponseError');
                expect(createMethodStub.called).to.be.true;
                expect(getForResponseStub.called).to.be.true;
                expect(putStub.called).to.be.false;
                done();
            });
        });
    });

    describe('deleteResource', function () {
        it('should delete resource', function (done) {
            testSubject.deleteResource({}, {}, { params: {method: {}} }, function (error) {
                expect(error).to.be.undefined;
                expect(getStub.called).to.be.true;
                expect(deleteMethodStub.called).to.be.true;
                expect(deleteStub.called).to.be.true;
                done();
            });
        });
        it('should fail delete resource', function (done) {
            deleteMethodStub.yields('deleteError');
            testSubject.deleteResource({}, {}, { params: {method: {}} }, function (error) {
                expect(error).to.equal('deleteError');
                expect(getStub.called).to.be.true;
                expect(deleteMethodStub.called).to.be.true;
                expect(deleteStub.called).to.be.false;
                done();
            });
        });
        it('should succeed if get from tracker return nothing', function (done) {
            getStub.yields();
            testSubject.deleteResource({}, {}, { params: {method: {}} }, function (error) {
                expect(error).to.be.undefined;
                expect(getStub.called).to.be.true;
                expect(deleteMethodStub.called).to.be.false;
                expect(deleteStub.called).to.be.false;
                done();
            });
        });
        it('should fail if get from tracker fails', function (done) {
            getStub.yields('getTrackerError');
            testSubject.deleteResource({}, {}, { params: {method: {}} }, function (error) {
                expect(error).to.equal('getTrackerError');
                expect(getStub.called).to.be.true;
                expect(deleteMethodStub.called).to.be.false;
                expect(deleteStub.called).to.be.false;
                done();
            });
        });
    });

    describe('updateResource', function () {
        it('should update resource', function (done) {
            testSubject.updateResource({}, {}, { params: {method: {}} }, function (error, resource) {
                expect(error).to.be.undefined;
                expect(resource).to.be.an('object');
                expect(getStub.called).to.be.true;
                expect(deleteMethodStub.called).to.be.true;
                expect(createMethodStub.called).to.be.true;
                expect(putStub.called).to.be.true;
                expect(getForResponseStub.called).to.be.true;
                done();
            });
        });
        it('should fail update resource if delete fails', function (done) {
            deleteMethodStub.yields('deleteError');
            testSubject.updateResource({}, {}, { params: {method: {}} }, function (error, resource) {
                expect(error).to.equal('deleteError');
                expect(resource).to.be.undefined;
                expect(getStub.called).to.be.true;
                expect(deleteMethodStub.called).to.be.true;
                expect(createMethodStub.called).to.be.false;
                expect(putStub.called).to.be.false;
                expect(getForResponseStub.called).to.be.false;
                done();
            });
        });
        it('should fail update resource if create fails', function (done) {
            createMethodStub.yields('createError');
            testSubject.updateResource({}, {}, { params: {method: {}} }, function (error, resource) {
                expect(error).to.equal('createError');
                expect(resource).to.be.undefined;
                expect(getStub.called).to.be.true;
                expect(deleteMethodStub.called).to.be.true;
                expect(createMethodStub.called).to.be.true;
                expect(getForResponseStub.called).to.be.false;
                expect(putStub.called).to.be.false;
                done();
            });
        });
        it('should fail if get for response fails', function (done) {
            getForResponseStub.yields('getForResponseError');
            testSubject.updateResource({}, {}, { params: {method: {}} }, function (error, resource) {
                expect(error).to.equal('getForResponseError');
                expect(resource).to.be.undefined;
                expect(getStub.called).to.be.true;
                expect(deleteMethodStub.called).to.be.true;
                expect(createMethodStub.called).to.be.true;
                expect(getForResponseStub.called).to.be.true;
                expect(putStub.called).to.be.false;
                done();
            });
        });
    });
});