
var extendedMindAnimationPhase;
var extendedMindAudio;
var extendedMindAnimationDelay = 0;
function setupHTML5Audio(animationEndCallback){
  extendedMindAudio = document.getElementById('theme');
  if (animationEndCallback) extendedMindAudio.endCallback = animationEndCallback;
}

function playExtendedMindAnimation(){
  if (extendedMindAnimationPhase === undefined){
    $('#em-animation-play').hide();

    if (extendedMindAudio.readyState >= extendedMindAudio.HAVE_FUTURE_DATA) {
      startAnimation();
    } else {
      extendedMindAudio.addEventListener('canplay', function () {
        startAnimation();
      }, false);
    }
  }

  function startAnimation(){
    resumeExtendedMindAnimation();
    animatePhase0();
  }
}

var videoCounter = 750;
var counterElem = $('#em-animation-counter');
function resumeCounter(){
  var interval = setInterval(function() {
      videoCounter--;
      // Display 'counter' wherever you want to display it.
      if (videoCounter < 0 || extendedMindAudio.paused) {
        // Display a login box
        clearInterval(interval);
      }else{
        if (videoCounter >= 600){
          counterElem.text('1:' + zfill(Math.floor((videoCounter-600)/10), 2));
        }else{
          counterElem.text('0:' + zfill(Math.floor(videoCounter/10), 2));
        }
      }
  }, 100);
}

function zfill(number, size) {
  number = number.toString();
  while (number.length < size) number = "0" + number;
  return number;
}

function pauseExtendedMindAnimation(){
  if (extendedMindAudio && !extendedMindAudio.ended){
    extendedMindAudio.pause();
    var elem = getCurrentAnimationElement();
    elem.addClass('paused');
    var playElem = $('#em-animation-play');
    playElem.show();
    playElem.click(resumeExtendedMindAnimation);
    $('#em-animation').off('click');
  }
}

function resumeExtendedMindAnimation(){
  extendedMindAudio.play();
  var volume = $('#volume');
  volume.removeClass('hide');
  $('#em-animation-play').hide();
  var elem = getCurrentAnimationElement();
  elem.removeClass('paused');
  if (counterElem){
    resumeCounter();
  }
  setTimeout(function(){
    $('#em-animation').click(pauseExtendedMindAnimation);
  });
}

function getCurrentAnimationElement(){
  var animationId = "#em-animation-" + extendedMindAnimationPhase;
  return $(animationId);
}

function switchPhases(){
  extendedMindAnimationPhase = extendedMindAnimationPhase + 1;
  $('#em-animation-' + (extendedMindAnimationPhase-1)).hide();
  var elem = getCurrentAnimationElement();
  elem.removeClass('hide');
  return elem;
}

function skipToAnimationPhase(phase){
  extendedMindAnimationPhase = phase-1;
  $('#em-animation-0').hide();
  $('#em-animation-play').hide();
  setTimeout(function(){
    $('#em-animation').click(pauseExtendedMindAnimation);
  });

  var animateFnString = 'animatePhase' + phase;
  window[animateFnString]();
}

function animatePhase0(){
  extendedMindAnimationPhase = 0;
  var elem = $('#em-animation-0');
  elem.animo( { animation: 'fadeOut', duration: (4.5 - extendedMindAnimationDelay), keep: true }, animatePhase1);
}

function animatePhase1(){
  var elem = switchPhases();
  elem.animo( { animation: 'fadeIn', duration: (2 - extendedMindAnimationDelay), keep: true }, function(){
    elem.animo( { animation: 'fadeOut', duration: (2 - extendedMindAnimationDelay), keep: true }, animatePhase2);
  });
}
function animatePhase2(){
  var elem = switchPhases();
  elem.animo( { animation: 'fadeIn', duration: (2 - extendedMindAnimationDelay), keep: true }, function(){
    elem.animo( { animation: 'fadeOut', duration: 2.5, keep: true }, animatePhase3);
  });
}

function animatePhase3(){
  var elem = switchPhases();
  elem.animo( { animation: 'fadeIn', duration: (2 - extendedMindAnimationDelay), keep: true }, function(){
    elem.animo( { animation: 'fadeOut', duration: (2.5 - extendedMindAnimationDelay), keep: true }, animatePhase4);
  });
}
function animatePhase4(){
  var elem = switchPhases();
  elem.animo( { animation: 'fadeIn', duration: (2 - extendedMindAnimationDelay), keep: true }, function(){
    elem.animo( { animation: 'fadeOut', duration: (2.5 - extendedMindAnimationDelay), keep: true }, animatePhase5);
  });
}
function animatePhase5(){
  var elem = switchPhases();
  elem.animo( { animation: 'fadeIn', duration: (2 - extendedMindAnimationDelay), keep: true }, function(){
    elem.animo( { animation: 'fadeOut', duration: (2.5 - extendedMindAnimationDelay), keep: true }, animatePhase6);
  });
}
function animatePhase6(){
  var elem = switchPhases();
  elem.animo( { animation: 'fadeIn', duration: (2 - extendedMindAnimationDelay), keep: true }, function(){
    elem.animo( { animation: 'fadeOut', duration: (2.5 - extendedMindAnimationDelay), keep: true }, animatePhase7);
  });
}
function animatePhase7(){
  var elem = switchPhases();
  elem.animo( { animation: 'fadeIn', duration: (2 - extendedMindAnimationDelay), keep: true }, function(){
    elem.animo( { animation: 'fadeOut', duration: (2.5 - extendedMindAnimationDelay), keep: true }, animatePhase8);
  });
}
function animatePhase8(){
  var elem = switchPhases();
  elem.animo( { animation: 'fadeIn', duration: (2 - extendedMindAnimationDelay), keep: true }, function(){
    elem.animo( { animation: 'fadeOut', duration: (2.5 - extendedMindAnimationDelay), keep: true }, animatePhase9);
  });
}
function animatePhase9(){
  var elem = switchPhases();
  $('.em-animation-background').each(function(i, obj) {
    $(obj).css("background-color", "#FFFFFF");
  });
  elem.animo( { animation: 'fadeIn', duration: 0.5, keep: true }, function(){
    elem.animo( { animation: 'fadeOut', duration: (3.5 - extendedMindAnimationDelay), keep: true }, animatePhase10);
  });
}
function animatePhase10(){
  var elem = switchPhases();
  elem.animo( { animation: 'fadeIn', duration: (2 - extendedMindAnimationDelay), keep: true }, function(){
    elem.animo( { animation: 'fadeOut', duration: (2.5 - extendedMindAnimationDelay), keep: true }, animatePhase11);
  });
}
function animatePhase11(){
  var elem = switchPhases();
  var createElem = $('#em-animation-11-create');
  var connectElem = $('#em-animation-11-connect');
  var careElem = $('#em-animation-11-care');

  createElem.removeClass('invisible');
  createElem.animo( { animation: 'fadeIn', duration: 1.2 }, function(){
    connectElem.removeClass('invisible');
    connectElem.animo( { animation: 'fadeIn', duration: 1.2 }, function(){
      careElem.removeClass('invisible');
      careElem.animo( { animation: 'fadeIn', duration: 1.2 }, function(){
        createElem.animo( { animation: 'fadeOut', duration: 1, keep: true });
        connectElem.animo( { animation: 'fadeOut', duration: 1, keep: true });
        careElem.animo( { animation: 'fadeOut', duration: 1, keep: true }, animatePhase12);
      });
    });
  });
}
function animatePhase12(){
  var elem = switchPhases();
  elem.animo( { animation: 'fadeIn', duration: (2 - extendedMindAnimationDelay), keep: true }, function(){
    elem.animo( { animation: 'fadeOut', duration: (2.5 - extendedMindAnimationDelay), keep: true }, animatePhase13);
  });
}
function animatePhase13(){
  var elem = switchPhases();

  var focusElem = $('#em-animation-13-focus');
  var organizeElem = $('#em-animation-13-organize');
  var keepElem = $('#em-animation-13-keep');

  focusElem.removeClass('invisible');
  focusElem.animo( { animation: 'fadeIn', duration: 1.2, keep: true }, function(){
    organizeElem.removeClass('invisible');
    organizeElem.animo( { animation: 'fadeIn', duration: 1.2, keep: true }, function(){
      keepElem.removeClass('invisible');
      keepElem.animo( { animation: 'fadeIn', duration: 1.2, keep: true }, function(){
        focusElem.animo( { animation: 'fadeOut', duration: 1, keep: true });
        organizeElem.animo( { animation: 'fadeOut', duration: 1, keep: true });
        keepElem.animo( { animation: 'fadeOut', duration: 1, keep: true }, animatePhase14);
      });
    });
  });
}
function animatePhase14(){
  var elem = switchPhases();
  elem.animo( { animation: 'fadeIn', duration: (2 - extendedMindAnimationDelay), keep: true }, function(){
    elem.animo( { animation: 'fadeOutDown', duration: (2.5 - extendedMindAnimationDelay), keep: true }, animatePhase15);
  });
}
function animatePhase15(){
  var elem = switchPhases();
  elem.animo( { animation: 'fadeIn', duration: (2 - extendedMindAnimationDelay), keep: true }, function(){
    elem.animo( { animation: 'fadeOut', duration: (2.5 - extendedMindAnimationDelay), keep: true }, animatePhase16);
  });
}
function animatePhase16(){
  var elem = switchPhases();
  elem.animo( { animation: 'fadeIn', duration: (2 - extendedMindAnimationDelay), keep: true });

  var changeElem = $('#em-animation-16-change');
  var wayElem = $('#em-animation-16-way');
  var youElem = $('#em-animation-16-you');
  var thinkElem = $('#em-animation-16-think');

  changeElem.removeClass('invisible');
  changeElem.animo( { animation: 'fadeIn', duration: 0.8, keep: true }, function(){
    wayElem.removeClass('invisible');
    wayElem.animo( { animation: 'fadeIn', duration: 0.8, keep: true }, function(){
      youElem.removeClass('invisible');
      youElem.animo( { animation: 'fadeIn', duration: 0.8, keep: true }, function(){
        thinkElem.removeClass('invisible');
        thinkElem.animo( { animation: 'fadeIn', duration: 0.8, keep: true }, function(){
          $('#em-animation').unbind('click');
          if (extendedMindAudio.endCallback) extendedMindAudio.endCallback();
          $('#volume').animo({ animation: 'fadeOut', duration: 0.5 }, function(){
            $('#volume').addClass('hide');
          });
          if (counterElem){
            counterElem.animo({ animation: 'fadeOut', duration: 0.5 }, function(){
              counterElem.addClass('hide');
            });
          }
        })
      });
    });
  });
}

