'use strict';

var response = require('./service/util/cfn-response');
var logger = require('./service/util/logger');
var handlers = {
    ApiAuthorizer: './commands/api-authorizer',
    ApiBasePathMapping: './commands/api-base-path-mapping',
    ApiDeploy: './commands/api-deploy',
    ApiDomainName: './commands/api-domain-name',
    ApiImport: './commands/api-import',
    ApiMethod: './commands/api-method',
    ApiModel: './commands/api-model',
    ApiResource: './commands/api-resource',
    RestApi: './commands/rest-api'
};
/* eslint global-require: 0 */
exports.handler = function (event, context) {
    logEvent(event);

    var resourceType = event.ResourceType;
    var command;
    try {
        var commandName = resourceType.split('::')[1];
        logger.log('Loading module', commandName);
        command = require(handlers[commandName]);
    } catch (error) {
        logger.log('Error loading handler', { error: error, stacktrace: error.stack });
        if (event.RequestType === 'Delete') {
            return cfnResponse(null, { success: true });
        }
        return cfnResponse(new Error('Unknown resource type: ' + resourceType));
    }

    try {
        var eventParams = command.getParameters(event);

        switch (event.RequestType) {
            case 'Create':
                return command.createResource(event, context, eventParams, cfnResponse);
            case 'Delete':
                return command.deleteResource(event, context, eventParams, cfnResponse);
            default:
                return command.updateResource(event, context, eventParams, cfnResponse);
        }
    } catch (error) {
        return cfnResponse(error);
    }

    function cfnResponse(error, result) {
        if (error) {
          if(error.code == 'TooManyRequestsException' && error.retryDelay) {
            setTimeout(function () {
              exports.handler(event, context)
            }, ((error.retryDelay + 5)*1000))
          } else {
            response.send(event, context, response.FAILED, error, event.PhysicalResourceId);
          }

        } else {
            response.send(event, context, response.SUCCESS, result, event.PhysicalResourceId);
        }
    }
};

function logEvent(event) {
    // Create copy so we don't distort the original event
    var eventCopy = JSON.parse(JSON.stringify(event));

    // Clean certain properties from the event copy so they are not logged
    if (eventCopy.ResourceProperties.certificatePrivateKey) {
        eventCopy.ResourceProperties.certificatePrivateKey = '***masked***';
    }
    logger.log('Processing event:\n', JSON.stringify(eventCopy));
}
