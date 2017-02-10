
config = require('../config/config.js');
log = require('../lib/log.js').getLogger(__filename);

module.exports.sendKey = function(email, firstname, key, cb) {

  try {
    var helper = require('sendgrid').mail;
    var from_email = new helper.Email(config.mailer.email, 'Dronesmith Hangar');
    var to_email = new helper.Email(email);
    var subject = 'Your Dronesmith API Key!';
    var mail = new helper.Mail(to_email);

    var personalization = new helper.Personalization();
    var sub_key = new helper.Substitution("{{api_key}}", key);
    var sub_name = new helper.Substitution("{{first_name}}", firstname)
    var sub_email = new helper.Substitution("{{email}}", email)
    personalization.addSubstitution(sub_name);
    personalization.addSubstitution(sub_key);
    personalization.addSubstitution(sub_email);
    personalization.addTo(to_email);

    mail.addPersonalization(personalization);
    mail.setTemplateId(config.mailer.templates.welcome);
    mail.setFrom(from_email);
    mail.setSubject(subject);

    var sg = require('sendgrid')(config.mailer.key);
    var request = sg.emptyRequest({
      method: 'POST',
      path: '/v3/mail/send',
      body: mail.toJSON(),
    });

    sg.API(request, function(error, response) {

      if (error) {
        cb(response.body.errors[0].message);
      } else {
        cb(null);
      }
    });

   } catch (e) {

     cb("Error sending email.")
   }

}

module.exports.sendPasswordResetLink = function(link, email, cb) {

  try {
    var helper = require('sendgrid').mail;
    var from_email = new helper.Email(config.mailer.email, 'Dronesmith Hangar');
    var to_email = new helper.Email(email);
    var subject = 'Dronesmith Hangar password reset';
    var mail = new helper.Mail(to_email);

    var personalization = new helper.Personalization();
    var sub_link = new helper.Substitution("{{reset_link}}", link);
    personalization.addSubstitution(sub_link);
    personalization.addTo(to_email);

    mail.addPersonalization(personalization);
    mail.setTemplateId(config.mailer.templates.reset_password);
    mail.setFrom(from_email);
    mail.setSubject(subject);

    var sg = require('sendgrid')(config.mailer.key);
    var request = sg.emptyRequest({
      method: 'POST',
      path: '/v3/mail/send',
      body: mail.toJSON(),
    });

    sg.API(request, function(error, response) {

      if (error) {
        cb(response.body.errors[0].message);
      } else {
        cb(null);
      }

    });

   } catch (e) {
     cb("Unkown error sending email.");
   }

}

module.exports.sendPasswordChanged = function(email, cb) {

  try {
    var helper = require('sendgrid').mail;
    var from_email = new helper.Email(config.mailer.email, 'Dronesmith Hangar');
    var to_email = new helper.Email(email);
    var subject = 'Dronesmith Hangar password has been changed';
    var mail = new helper.Mail(to_email);

    var personalization = new helper.Personalization();
    personalization.addTo(to_email);

    mail.addPersonalization(personalization);
    mail.setTemplateId(config.mailer.templates.password_changed);
    mail.setFrom(from_email);

    mail.setSubject(subject);

    var sg = require('sendgrid')(config.mailer.key);
    var request = sg.emptyRequest({
      method: 'POST',
      path: '/v3/mail/send',
      body: mail.toJSON(),
    });

    sg.API(request, function(error, response) {
      if (error) {
        cb(response.body.errors[0].message);
      } else {
        cb(null);
      }

    });

   } catch (e) {
     cb("Unkown error sending email.");
   }

}
