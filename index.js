/*jslint node: true */
'use strict';

var merge = require('merge');
var Slack = require('node-slack');
require('dotenv').load({ silent: true });

var slack = new Slack(process.env.WATCHMEN_SLACK_NOTIFICATION_URL);
var defaultOptions = {
  channel: '#general',
  username: 'Watchmen',
  icon_emoji: ':mega:'
};

var notifications = process.env.WATCHMEN_SLACK_NOTIFICATION_EVENTS.split(' ');
console.log('Slack notifications are turned on for:');
console.log(notifications);

if ('WATCHMEN_SLACK_NOTIFICATION_CHANNEL' in process.env) {
  defaultOptions.channel = process.env.WATCHMEN_SLACK_NOTIFICATION_CHANNEL;
}

if ('WATCHMEN_SLACK_NOTIFICATION_USERNAME' in process.env) {
  defaultOptions.username = process.env.WATCHMEN_SLACK_NOTIFICATION_USERNAME;
}

if ('WATCHMEN_SLACK_NOTIFICATION_ICON_EMOJI' in process.env) {
  defaultOptions.icon_emoji = process.env.WATCHMEN_SLACK_NOTIFICATION_ICON_EMOJI;
}

function handleEvent(eventName) {
  return function(service, data) {
    if (notifications.indexOf(eventName) === -1) {
      return;
    }

    var friendlyNames = {
      'latency-warning': 'Latency Warning',
      'new-outage':      'New Outage',
      'current-outage':  'Current Outage',
      'service-back':    'Service Back',
      'service-error':   'Service Error',
      'service-ok':      'Service OK'
    };

    var text    = '[' + friendlyNames[eventName] + '] on ' + service.name + ' ' + service.url;
    var options = {
      text: text
    };

    slack.send(merge(defaultOptions, options));
  };
}

function SlackPlugin(watchmen) {
  watchmen.on('latency-warning', handleEvent('latency-warning'));
  watchmen.on('new-outage',      handleEvent('new-outage'));
  watchmen.on('current-outage',  handleEvent('current-outage'));
  watchmen.on('service-back',    handleEvent('service-back'));
  watchmen.on('service-error',   handleEvent('service-error'));
  watchmen.on('service-ok',      handleEvent('service-ok'));
}

exports = module.exports = SlackPlugin;
