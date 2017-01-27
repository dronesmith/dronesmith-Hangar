// TODO
config = require('../config/config.js')
var helper = require('sendgrid').mail;

var from_email = new helper.Email('support@dronesmith.io');
var to_email = new helper.Email('pfjare@gmail.com');
var subject = 'Your Dronesmith API Key!';
var mail = new helper.Mail(to_email);

var personalization = new helper.Personalization();
var sub_key = new helper.Substitution("[%api_key%]", "fake0cuNEt-JjssJLsHVi");
var sub_name = new helper.Substitution("[%first_name | Default Value%]", "Westin")
personalization.addSubstitution(sub_name);
personalization.addSubstitution(sub_key);
personalization.addTo(to_email)

mail.addPersonalization(personalization);
mail.setTemplateId(config.mailer.templateId);
mail.setFrom(from_email);
mail.setSubject(subject);

var sg = require('sendgrid')(config.mailer.key);
var request = sg.emptyRequest({
  method: 'POST',
  path: '/v3/mail/send',
  body: mail.toJSON(),
});

sg.API(request, function(error, response) {
  console.log(response.statusCode);
  console.log(response.body);
  console.log(response.headers);
});
