
/*
 * GET users listing.
 */

exports.list = function(req, res){
  var users = [
    { name: 'Ryo', email: 'ryo@gmail.com' },
    { name: 'Shohei', email: 'shohei@gmail.com' },
    { name: 'Shu', email: 'shu@gmail.com' }
  ];
  res.render('users', {
    users: users
  });
};
