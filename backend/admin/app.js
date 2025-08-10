var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var usuariosRouter = require('./routes/rest/usuarios')
var administradorDeProyectosRouter = require('./routes/rest/administradorDeProyectos')
var proyectosRouter = require('./routes/rest/proyectos')
var tareasRouter = require('./routes/rest/tareas')
var bitacorasRouter = require('./routes/rest/bitacoras')
var adjuntosRouter = require('./routes/rest/adjuntos')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/rest/usuarios', usuariosRouter);
app.use('/rest/administradorDeProyectos', administradorDeProyectosRouter);
app.use('/rest/proyectos', proyectosRouter);
app.use('/rest/tareas', tareasRouter)
app.use('/rest/bitacoras', bitacorasRouter)
app.use('/rest/adjuntos', adjuntosRouter)
//app.use('/api/usuarios', require('./routes/rest/usuarios'));


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
