'use strict';

var GitHubStrategy = require('passport-github').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/users');
var configAuth = require('./auth');

module.exports = function(passport) {
	passport.serializeUser(function(user, done) {
		done(null, user.id);
	});

	passport.deserializeUser(function(id, done) {
		User.findById(id, function(err, user) {
			done(err, user);
		});
	});

	passport.use(new GoogleStrategy({
			clientID: configAuth.googleAuth.clientID,
			clientSecret: configAuth.googleAuth.clientSecret,
			callbackURL: configAuth.googleAuth.callbackURL
		},
		function(token, refreshToken, profile, done) {

			process.nextTick(function() {
				if (!profile.emails) {
					return done({
						msg: "No email associated with account"
					});
				}
				User.findOne({
					'email': profile.emails[0].value
				}, function(err, user) {
					if (err) {
						return done(err);
					}

					if (user) {
						return done(null, user);
					}
					else {
						var newUser = new User();
						newUser.email = profile.emails[0].value;
						if (profile.image) {
							newUser.imageUrl = profile.image.url;
						}
						newUser.displayName = profile.displayName;

						newUser.save(function(err) {
							if (err) {
								throw err;
							}

							return done(null, newUser);
						});
					}
				});
			});
		}));

	passport.use(new FacebookStrategy({
			clientID: configAuth.facebookAuth.clientID,
			clientSecret: configAuth.facebookAuth.clientSecret,
			callbackURL: configAuth.facebookAuth.callbackURL,
			profileFields: ['emails', 'displayName', 'photos']

		},
		function(token, refreshToken, profile, done) {
			process.nextTick(function() {
				if(!profile.emails){
					return done({
						msg: "No email associated with account"
					});
				}
				User.findOne({
					'email': profile.emails[0].value
				}, function(err, user) {
					if (err) {
						return done(err);
					}

					if (user) {
						return done(null, user);
					}
					else {
						var newUser = new User();

						newUser.email = profile.emails[0].value;
						if (profile.photos) {
							newUser.imageUrl = profile.photos[0].value;
						}
						newUser.displayName = profile.displayName;

						newUser.save(function(err) {
							if (err) {
								throw err;
							}

							return done(null, newUser);
						});
					}
				});
			});
		}));

	passport.use(new GitHubStrategy({
			clientID: configAuth.githubAuth.clientID,
			clientSecret: configAuth.githubAuth.clientSecret,
			callbackURL: configAuth.githubAuth.callbackURL
		},
		function(token, refreshToken, profile, done) {
			if(!profile.emails){
				return done({
						msg: "No email associated with account"
				});
			}

			process.nextTick(function() {
				User.findOne({
					'email': profile.emails[0].value
				}, function(err, user) {
					if (err) {
						return done(err);
					}

					if (user) {
						return done(null, user);
					}
					else {
						var newUser = new User();
						newUser.email = profile.emails[0].value;
						if(profile.photos){
							newUser.imageUrl = profile.photos[0].value;
						}
						newUser.displayName = profile.displayName;

						newUser.save(function(err) {
							if (err) {
								throw err;
							}

							return done(null, newUser);
						});
					}
				});
			});
		}));



	passport.use(new LocalStrategy({
			usernameField: 'email'
		},
		function(email, password, done) {
			User.findOne({
				email: email
			}, function(err, user) {
				if (err) {
					return done(err);
				}
				if (!user) {
					return done(null, false, {
						message: 'Email not found'
					});
				}
				user.comparePassword(password, function(err, isMatch) {
					if (isMatch) {
						return done(null, user);
					}
					else {
						return done(null, false, {
							message: 'Invalid password.'
						});
					}
				});
			});
		}
	));


};
