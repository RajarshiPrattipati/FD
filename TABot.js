
'use strict';

const request = require('request');
const java = require('java');
const BootBot = require('BootBot');
const config = require('config');


const bot = new BootBot({
  accessToken: config.get('access_token'),
  verifyToken: config.get('verify_token'),
  appSecret: config.get('app_secret')
});


// Setting this to true would disable the text input on mobile
// and the user will only be able to communicate via the persistent menu.
const disableInput = false;
var mob = '9985115641';

bot.setPersistentMenu([
  {
    title: 'My Account',
    type: 'nested',
    call_to_actions: [
      {
        title: 'Check Balance',
        type: 'postback',
        payload: 'PAYBILL_PAYLOAD'
      },
      {
        title: 'KYC Status',
        type: 'postback',
        payload: 'KYC_PAYLOAD'
      },
      {
        title: 'Linked Accounts',
        type: 'postback',
        payload: 'LINKED_PAYLOAD'
      },
      {
        title: 'Fund Transfer',
        type: 'postback',
        payload: 'TRANS_PAYLOAD'
      },
      {
        title: 'Mini Statement',
        type: 'postback',
        payload: 'HISTORY_PAYLOAD'
      },
      /*{
        title: "FAQ's",
        type: 'postback',
        payload: 'CONTACT_INFO_PAYLOAD'
      }*/
    ]
  },
  {
    title: 'Go to Website',
    type: 'web_url',
    url: 'http://transactionanalysts.com/'
  }
], disableInput);

bot.on('postback:PAYBILL_PAYLOAD', (payload, chat) => {
  chat.conversation((convo) =>
  {
      convo.ask(`Hello! Please enter your registered Mobile Number?`, (payload, data) => {
      mob = payload.message.text;
      convo.set('mob',mob);
      convo.say(`Oh, your number is ${mob}.`).then(() => makeRequest(convo));
      convo.end();
      }); 
  }
  );
 });  

  bot.on('postback:HISTORY_PAYLOAD', (payload, chat) => {
  chat.conversation((convo) =>
  {
      convo.ask(`Hello! Please enter your registered Mobile Number?`, (payload, data) => {
      mob = payload.message.text;
      if(mob == "")
      	mob = 9985115641;
      convo.set('mob',mob);
      convo.say(`Oh, your number is ${mob}.`).then(() => getMini(convo));
      convo.end();
      }); 
  }
  );
 });    

  bot.on('postback:KYC_PAYLOAD', (payload, chat) => {
  chat.conversation((convo) =>
  {
      convo.ask(`Hello! Please enter your registered Mobile Number?`, (payload, data) => {
      mob = payload.message.text;
      convo.set('mob',mob);
      convo.say(`Oh, your number is ${mob}.`).then(() => getK(convo));
      convo.end();
      }); 
  }
  );
});
  bot.on('postback:TRANS_PAYLOAD', (payload, chat) => {
  chat.conversation((convo) =>
  {
      convo.ask(`Hello! Please enter your registered Mobile Number?`, (payload, data) => {
      	mob = payload.message.text;
      	convo.set('mob',mob);
      	convo.ask('Who would you like to transfer to ?' , (payload,data) => {
      		var to = payload.message.text;
      		convo.set('to',to);
      		convo.ask('How much would you like to transfer?' , (payload,data) => {
      			var amt = parseInt(payload.message.text);
      			convo.set('amt',amt);
      			getF(convo);
      			convo.end();
      		});
      	});
      }); 
  }
  );
});
  bot.on('postback:LINKED_PAYLOAD', (payload, chat) => {
  chat.conversation((convo) =>
  {
      convo.ask(`Hello! Please enter your registered Mobile Number?`, (payload, data) => {
      mob = payload.message.text;
      convo.set('mob',mob);
      convo.say(`Oh, your number is ${mob}.`).then(() => getL(convo));
      convo.end();
      }); 
  }
  );
});


const getMini = (convo) => {
	
  var xml = `<?xml version="1.0" encoding="UTF-8"?>
<Request type="Bot_Statement" Terminal_Number="65" Terminal_Name="TA">
<Machine_Id>70b599573ad687e</Machine_Id> 
<Mobile_num>`+convo.get('mob')+`</Mobile_num>
<IsRequest_Log>Yes</IsRequest_Log>
<Statement>Yes</Statement>
<AgencyCode>100000000</AgencyCode>
<Statement_Count>10</Statement_Count>
<Date>10-07-2017</Date>
</Request>`;
  var eml;
  java.classpath.push("EncryptionDecryption.jar");
  java.newInstance("encryptiondecryption.EncryptionDecryption",function(err,list)
  {	
    eml = list.EncryptionSync(xml);
    console.log("EML : "+eml);
    var options = {
      url : 'https://staging.transactionanalysts.com:444/eapi/process.aspx',
      method : 'POST',
      headers : 
      {
        'ContentType':"text/xml",
      },
      body : eml,
    };

    function callback(error, response, body) {
      if (!error && response.statusCode == 200) {
		console.log('callback');        
        var tok = JSON.parse(body)['AccessTokenID'];
        convo.say('Please follow this link :  https://staging.transactionanalysts.com:444/eweb/process.aspx?id='+tok);
      }
   };
    var req = request( options,callback);
    //console.log(req.body);
  });
};   

const makeRequest = (convo) => {
  var xml = `<?xml version="1.0" encoding="UTF-8"?>
    <Request type="BotUserBalEnq" Terminal_Number="65" Terminal_Name="TA">
    <Machine_Id>70b599573ad687e</Machine_Id> 
    <Mobile_num>`+convo.get('mob')+`</Mobile_num>
    <IsRequest_Log>Yes</IsRequest_Log>
    <AgencyCode>100000000</AgencyCode>
    <Date>10-07-2017</Date>
    </Request>`;
  var eml;
  java.classpath.push("EncryptionDecryption.jar");
  java.newInstance("encryptiondecryption.EncryptionDecryption",function(err,list)
  {
    eml = list.EncryptionSync(xml);
    console.log("EML : "+eml);
    var options = {
      url : 'https://staging.transactionanalysts.com:444/eapi/process.aspx',
      method : 'POST',
      headers : 
      {
        'ContentType':"text/xml",
      },
      body : eml,
    };

    function callback(error, response, body) {
      if (!error && response.statusCode == 200) {
		console.log('callback');        
        var tok = JSON.parse(body)['AccessTokenID'];
        convo.say('Please follow this link :  https://staging.transactionanalysts.com:444/eweb/process.aspx?id='+tok);
      }
   };
    var req = request( options,callback);
    //console.log(req.body);
  });
};
  

const getK = (convo) => {
	
  var xml = `<?xml version="1.0" encoding="UTF-8"?>
<Request type="Bot_UserKyc_Status" Terminal_Number="65" Terminal_Name="TA">
 <Machine_Id>210.18.180.20</Machine_Id>
 <Mobile_num>`+convo.get('mob')+`</Mobile_num>
 <IsRequest_Log>Yes</IsRequest_Log>
 <AgencyCode>TA43484389</AgencyCode> 
 <Date>2017-12-19 05:12:16</Date>
</Request>`;
  var eml;
  java.classpath.push("EncryptionDecryption.jar");
  java.newInstance("encryptiondecryption.EncryptionDecryption",function(err,list)
  {	
    eml = list.EncryptionSync(xml);
    console.log("EML : "+eml);
    var options = {
      url : 'https://staging.transactionanalysts.com:444/eapi/process.aspx',
      method : 'POST',
      headers : 
      {
        'ContentType':"text/xml",
      },
      body : eml,
    };

    function callback(error, response, body) {
      if (!error && response.statusCode == 200) {
		console.log('callback');        
        var tok = JSON.parse(body)['AccessTokenID'];
        convo.say('Please follow this link :  https://staging.transactionanalysts.com:444/eweb/process.aspx?id='+tok);
      }
   };
    var req = request( options,callback);
    //console.log(req.body);
  });
};   


const getL = (convo) => {
	
  var xml = `<?xml version="1.0" encoding="UTF-8"?>
<Request type="Bot_UserLinkedAccounts" Terminal_Number="65" Terminal_Name="TA">
 <Machine_Id>210.18.180.20</Machine_Id>
 <Mobile_num>`+convo.get('mob')+`</Mobile_num>
 <IsRequest_Log>Yes</IsRequest_Log>
 <AgencyCode>TA43484389</AgencyCode> 
 <Date>2017-12-19 05:12:16</Date>
</Request>`;
  var eml;
  java.classpath.push("EncryptionDecryption.jar");
  java.newInstance("encryptiondecryption.EncryptionDecryption",function(err,list)
  {	
    eml = list.EncryptionSync(xml);
    console.log("EML : "+eml);
    var options = {
      url : 'https://staging.transactionanalysts.com:444/eapi/process.aspx',
      method : 'POST',
      headers : 
      {
        'ContentType':"text/xml",
      },
      body : eml,
    };

    function callback(error, response, body) {
      if (!error && response.statusCode == 200) {
		console.log('callback');        
        var tok = JSON.parse(body)['AccessTokenID'];
        convo.say('Please follow this link :  https://staging.transactionanalysts.com:444/eweb/process.aspx?id='+tok);
      }
   };
    var req = request( options,callback);
    //console.log(req.body);
  });
};   


const getF = (convo) => {

  var xml = `<?xml version="1.0" encoding="UTF-8"?>
<Request type="BotUser_Fund_Transfer" Terminal_Number="65" Terminal_Name="TA">
<Machine_Id>70b599573ad687e</Machine_Id>
<Mobile_num>`+convo.get('mob')+`</Mobile_num>
<To_MobileNo>`+convo.get('to')+`</To_MobileNo>
<AgencyCode>100000000</AgencyCode>
<IsRequest_Log>Yes</IsRequest_Log>
<Order_Id>`+Math.floor(Math.random() * 10000000000000)+`</Order_Id>
<Narration></Narration>
<Amount>`+convo.get('amt')+`</Amount>
<Date></Date>
</Request>`;
  var eml;
  java.classpath.push("EncryptionDecryption.jar");
  java.newInstance("encryptiondecryption.EncryptionDecryption",function(err,list)
  {	
    eml = list.EncryptionSync(xml);
    var options = {
      url : 'https://staging.transactionanalysts.com:444/eapi/process.aspx',
      method : 'POST',
      headers : 
      {
        'ContentType':"text/xml",
      },
      body : eml,
    };

    function callback(error, response, body) {
      if (!error && response.statusCode == 200) {      
        var tok = JSON.parse(body)['AccessTokenID'];
        console.log(body);
        convo.say('Please follow this link :  https://staging.transactionanalysts.com:444/eweb/process.aspx?id='+tok);
      }
   };
    var req = request( options,callback);
    //console.log(req.body);
  });
};   


  
  
  /*
    request.post(url, { json: true }, (err, res, body) => {
      if (err) { return console.log(err); }
      console.log(body.url);
      console.log(body.explanation);
    });
   */ 


bot.on('postback:CONTACT_INFO_PAYLOAD', (payload, chat) => {
  chat.say(`Contact info here...`);
});

bot.start();
