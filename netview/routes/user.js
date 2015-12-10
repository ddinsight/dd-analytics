var express = require('express');
var path = require('path');

var TAG = 'login_'

exports.logout = function(req, res){
	if(req.session.user_id){
		delete req.session.user_id
		res.redirect('/login');
	}
}

exports.login = function(req, res){
	var aa = false;
	console.log(req.body);
	console.log(req.session.user_id);
	if(req.body.inputEmail == 'demo@airplug.com' && req.body.inputPassword=='demo'){
		aa = true;
	}
	// console.log(aa);
	if(req.session.user_id){
		res.redirect('/oreal');
	}else{		
		if(req.body.inputEmail && req.body.inputPassword && aa){
			req.session.user_id = req.body.inputEmail;
			console.log(req.session.user_id);
			// request.session.returnTo = request.path;
			res.redirect(req.session.returnTo || '/');
		}else{
			res.redirect('/login');
		}
	}
};
