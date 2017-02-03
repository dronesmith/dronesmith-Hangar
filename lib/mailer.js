
config = require('../config/config.js');
log = require('../lib/log.js').getLogger(__filename);

module.exports.sendKey = function(email, firstname, key, cb) {

  log.warn("Email with key sent");
  // try {
  //
  //  } catch (e) {
  //
  //  }
  // var helper = require('sendgrid').mail;
  // var from_email = new helper.Email('support@dronesmith.io');
  // var to_email = new helper.Email('pfjare@gmail.com');
  // var subject = 'Your Dronesmith API Key!';
  // var mail = new helper.Mail(to_email);
  //
  // var personalization = new helper.Personalization();
  // var sub_key = new helper.Substitution("[%api_key%]", key);
  // var sub_name = new helper.Substitution("[%first_name | Default Value%]", "Westin")
  // personalization.addSubstitution(sub_name);
  // personalization.addSubstitution(sub_key);
  // personalization.addTo(to_email)
  //
  // mail.addPersonalization(personalization);
  // mail.setTemplateId(config.mailer.templateId);
  // mail.setFrom(from_email);
  // mail.setSubject(subject);
  //
  // var sg = require('sendgrid')(config.mailer.key);
  // var request = sg.emptyRequest({
  //   method: 'POST',
  //   path: '/v3/mail/send',
  //   body: mail.toJSON(),
  // });
  //
  // sg.API(request, function(error, response) {
  //   console.log(response.statusCode);
  //   console.log(response.body);
  //   console.log(response.headers);
  // });
}

module.exports.sendPassword = function(email, firstname, password, cb) {
  log.warn("Email with key sent");

  // var helper = require('sendgrid').mail;
  // var from_email = new helper.Email('support@dronesmith.io');
  // var to_email = new helper.Email(email);
  // var subject = 'Your Dronesmith Hangar password has been reset';
  // var mail = new helper.Mail(to_email);
  //
  // var personalization = new helper.Personalization();
  // var sub_key = new helper.Substitution("[%firstname%]", key);
  // var sub_name = new helper.Substitution("[%firstname%]", firstname)
  // personalization.addSubstitution(sub_name);
  // personalization.addSubstitution(sub_key);
  // personalization.addTo(to_email)
  //
  // mail.addPersonalization(personalization);
  // mail.setTemplateId(config.mailer.templateId);
  // mail.setFrom(from_email);
  // mail.setSubject(subject);
  //
  // var sg = require('sendgrid')(config.mailer.key);
  // var request = sg.emptyRequest({
  //   method: 'POST',
  //   path: '/v3/mail/send',
  //   body: mail.toJSON(),
  // });
  //
  // sg.API(request, function(error, response) {
  //   console.log(response.statusCode);
  //   console.log(response.body);
  //   console.log(response.headers);
  // });
}
