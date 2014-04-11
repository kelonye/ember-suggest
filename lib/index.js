/**
  * Module dependencies.
  */
require('ember');
var Pillbox = require('pillbox');

// template

var template = Em.Handlebars.compile([
  '{{input value=view.userInput}}',
  '<ul>',
  '{{#each view.suggestions}}',
  '<li {{action "addTag" this target=view}}>',
  '{{partial "suggestion-item"}}',
  '</li>',
  '{{/each}}',
  '</ul>'
].join(''));

// default suggestion template

Em.TEMPLATES['suggestion-item'] = Em.Handlebars.compile('{{this}}');

// mixin to be applied to an Em.View

module.exports = Em.Mixin.create({

  // public

  suggestionsLimit: 5,
  tagProperty: null,
  priorityProperty: null,

  // private

  classNames: ['component-ember-suggest'],
  template: template,
  init: function(){

    this._super();

    var tags = this.get('value');
    if (!(tags instanceof Array)){
      this.set('value', []);
      tags = this.get('value');
    }

  },
  didInsertElement: function(){
    
    var self = this;

    this._super();

    var tags = this.get('value');
    var input = Pillbox(Em.$('input')[0]);

    input.on('add', function(tag){
      tags.pushObject(tag);
    });
    input.on('remove', function(tag){
      tags.removeObject(tag);
    });

    this.set('input', input);

  },
  suggestions: function(){
    var ret = [];
    var count = 0;
    var tags = this.get('value');
    var tagProperty = this.get('tagProperty');
    var suggestions = this.get('content');
    var limit = this.get('suggestionsLimit');
    var input = this.get('userInput');
    var priorityProperty = this.get('priorityProperty');
    if (priorityProperty) suggestions = suggestions.sortBy(priorityProperty);
    if (input) suggestions = suggestions.filter(function(suggestion){
      var tag = (tagProperty)
        ? suggestion.get(tagProperty)
        : suggestion;
      var re = RegExp(input, 'i');
      return re.test(tag);
    });
    for (var i=0; i<suggestions.length; i++){
      var suggestion = suggestions[i];
      var tag = (tagProperty)
        ? suggestion.get(tagProperty)
        : suggestion;
      if (!tags.contains(tag)){
        ++count;
        ret.pushObject(suggestion);
        if (count >= limit) break;
      }
    };
    return ret;
  }.property('value.length', 'content.length', 'userInput'),

  actions: {
    addTag: function(tag){
      var tagProperty = this.get('tagProperty');
      if (tagProperty) tag = tag.get(tagProperty);
      var input = this.get('input'); 
      input.add(tag);
      this.set('userInput', '');
    }
  }

});
