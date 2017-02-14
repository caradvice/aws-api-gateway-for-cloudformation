'use strict';

var expect = require('chai').expect;

var testSubject = require('../../../../lib/service/api-domain-name/api-domain-name-event');

describe('ApiDomainNameEvent', function () {

    describe('getParameters', function () {
        var event;
        beforeEach(function () {
            event = {
                ResourceProperties: {
                    certificateBody: '-----BEGIN CERTIFICATE-----CertificateBody-----END CERTIFICATE-----',
                    certificateChain: '-----BEGIN CERTIFICATE-----CertificateChain-----END CERTIFICATE-----',
                    certificateName: 'CertificateName',
                    certificatePrivateKey: '-----BEGIN RSA PRIVATE KEY-----CertificatePrivateKey-----END RSA PRIVATE KEY-----',
                    domainName: 'DomainName'
                },
                OldResourceProperties: {
                    certificateBody: '-----BEGIN CERTIFICATE-----CertificateBody2-----END CERTIFICATE-----',
                    certificateChain: '-----BEGIN CERTIFICATE-----CertificateChain2-----END CERTIFICATE-----',
                    certificateName: 'CertificateName2',
                    certificatePrivateKey: '-----BEGIN RSA PRIVATE KEY-----CertificatePrivateKey2-----END RSA PRIVATE KEY-----',
                    domainName: 'DomainName2'
                }
            };
        });
        it('should give both old and new parameters', function (done) {
            var parameters = testSubject.getParameters(event);
            expect(parameters.params.certificateBody).to.equal('-----BEGIN CERTIFICATE-----\nCertificateBody\n-----END CERTIFICATE-----');
            expect(parameters.params.certificateChain).to.equal('-----BEGIN CERTIFICATE-----\nCertificateChain\n-----END CERTIFICATE-----');
            expect(parameters.params.certificateName).to.equal('CertificateName');
            expect(parameters.params.certificatePrivateKey).to.equal('-----BEGIN RSA PRIVATE KEY-----\nCertificatePrivateKey\n-----END RSA PRIVATE KEY-----');
            expect(parameters.params.domainName).to.equal('DomainName');

            expect(parameters.old.certificateBody).to.equal('-----BEGIN CERTIFICATE-----\nCertificateBody2\n-----END CERTIFICATE-----');
            expect(parameters.old.certificateChain).to.equal('-----BEGIN CERTIFICATE-----\nCertificateChain2\n-----END CERTIFICATE-----');
            expect(parameters.old.certificateName).to.equal('CertificateName2');
            expect(parameters.old.certificatePrivateKey).to.equal('-----BEGIN RSA PRIVATE KEY-----\nCertificatePrivateKey2\n-----END RSA PRIVATE KEY-----');
            expect(parameters.old.domainName).to.equal('DomainName2');
            done();
        });
        it('should give both old and new parameters with iamServerCertificateName', function (done) {
            event.ResourceProperties.iamServerCertificateName = 'IamCertificateName';
            event.OldResourceProperties.iamServerCertificateName = 'IamCertificateName2';
            delete event.ResourceProperties.certificateBody;
            delete event.ResourceProperties.certificateChain;
            delete event.OldResourceProperties.certificateBody;
            delete event.OldResourceProperties.certificateChain;
            var parameters = testSubject.getParameters(event);
            expect(parameters.params.iamServerCertificateName).to.equal('IamCertificateName');
            expect(parameters.params.certificateName).to.equal('CertificateName');
            expect(parameters.params.certificatePrivateKey).to.equal('-----BEGIN RSA PRIVATE KEY-----\nCertificatePrivateKey\n-----END RSA PRIVATE KEY-----');
            expect(parameters.params.domainName).to.equal('DomainName');

            expect(parameters.old.iamServerCertificateName).to.equal('IamCertificateName2');
            expect(parameters.old.certificateName).to.equal('CertificateName2');
            expect(parameters.old.certificatePrivateKey).to.equal('-----BEGIN RSA PRIVATE KEY-----\nCertificatePrivateKey2\n-----END RSA PRIVATE KEY-----');
            expect(parameters.old.domainName).to.equal('DomainName2');
            done();
        });
        it('should not yield old properties if not in event', function (done) {
            delete event.OldResourceProperties;
            var parameters = testSubject.getParameters(event);
            expect(parameters.params).to.be.an('object');
            expect(parameters.old).to.equal(null);
            done();
        });
        it('should yield an error due to missing certificateBody and iamServerCertificateName', function (done) {
            delete event.ResourceProperties.certificateBody;
            delete event.ResourceProperties.iamServerCertificateName;
            delete event.OldResourceProperties;
            var fn = function () { testSubject.getParameters(event); };
            expect(fn).to.throw(Error);
            expect(fn).to.throw(/iamServerCertificateName/);
            expect(fn).to.throw(/certificateBody/);
            done();
        });
        it('should yield an error due to missing certificateBody', function (done) {
            delete event.ResourceProperties.certificateBody;
            delete event.OldResourceProperties;
            var fn = function () {
                testSubject.getParameters(event);
            };
            expect(fn).to.throw(Error);
            expect(fn).to.throw(/certificateBody/);
            done();
        });
        it('should yield an error due to missing certificateChain', function (done) {
            delete event.ResourceProperties.certificateChain;
            var fn = function () { testSubject.getParameters(event); };
            expect(fn).to.throw(Error);
            expect(fn).to.throw(/certificateChain/);
            done();
        });
        it('should yield an error due to missing certificateName', function (done) {
            delete event.ResourceProperties.certificateName;
            var fn = function () { testSubject.getParameters(event); };
            expect(fn).to.throw(Error);
            expect(fn).to.throw(/certificateName/);
            done();
        });
        it('should yield an error due to missing certificatePrivateKey', function (done) {
            delete event.ResourceProperties.certificatePrivateKey;
            var fn = function () { testSubject.getParameters(event); };
            expect(fn).to.throw(Error);
            expect(fn).to.throw(/certificatePrivateKey/);
            done();
        });
        it('should yield an error due to missing domainName', function (done) {
            delete event.ResourceProperties.domainName;
            var fn = function () { testSubject.getParameters(event); };
            expect(fn).to.throw(Error);
            expect(fn).to.throw(/domainName/);
            done();
        });
        it('should not validate parameters id RequestType is Delete', function (done) {
            var event = {
                RequestType: 'Delete',
                ResourceProperties: {
                    domainName: 'DomainName'
                }
            };
            var parameters = testSubject.getParameters(event);
            expect(parameters.params.domainName).to.equal('DomainName');
            done();
        });
    });

    describe('getPatchOperations', function () {
        it('should give only valid patch operations', function (done) {
            var event = {
                params: {
                    certificateBody: 'CertificateBody',
                    certificateChain: 'CertificateChain',
                    certificateName: 'CertificateName',
                    certificatePrivateKey: 'CertificatePrivateKey',
                    domainName: 'DomainName'
                },
                old: {
                    certificateBody: 'CertificateBody2',
                    certificateChain: 'CertificateChain2',
                    certificateName: 'CertificateName2',
                    certificatePrivateKey: 'CertificatePrivateKey2',
                    domainName: 'DomainName2'
                }
            };
            var patchOperations = testSubject.getPatchOperations(event);
            expect(patchOperations).to.be.an('Array');
            expect(patchOperations.length).to.equal(2);
            done();
        });
    });
});
