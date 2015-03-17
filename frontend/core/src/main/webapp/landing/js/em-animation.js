
var animationPhase = 0;
var audio = document.getElementById('theme');
function playExtendedMindAnimation(){
  $('#em-animation-play').hide();
  if (audio.readyState >= audio.HAVE_FUTURE_DATA) {
    startAnimation();
  } else {
    audio.addEventListener('canplay', function () {
      startAnimation();
    }, false);
  }

  function startAnimation(){
    resumeExtendedMindAnimation();
    animatePhase0();
  }
}

function pauseExtendedMindAnimation(){
  audio.pause();
  var elem = getCurrentAnimationElement();
  elem.addClass('paused');
  var playElem = $('#em-animation-play');
  playElem.show();
  playElem.click(resumeExtendedMindAnimation);
  $('#em-animation').off('click');
}

function resumeExtendedMindAnimation(){
  audio.play();
  var volume = $('#volume');
  volume.removeClass('hide');
  var elem = getCurrentAnimationElement();
  elem.removeClass('paused');
  setTimeout(function(){
    $('#em-animation').click(pauseExtendedMindAnimation);
  });
}

function getCurrentAnimationElement(){
  var animationId = "#em-animation-" + animationPhase;
  return $(animationId);
}

function switchPhases(){
  animationPhase = animationPhase + 1;
  $('#em-animation-' + (animationPhase-1)).hide();
  var elem = getCurrentAnimationElement();
  elem.removeClass('hide');
  return elem;
}

function skipToAnimationPhase(phase){
  animationPhase = phase-1;
  $('#em-animation-0').hide();
  $('#em-animation-play').hide();
  setTimeout(function(){
    $('#em-animation').click(pauseExtendedMindAnimation);
  });

  var animateFnString = 'animatePhase' + phase;
  window[animateFnString]();
}

function animatePhase0(){
  var elem = $('#em-animation-0');
  elem.animo( { animation: 'fadeOut', duration: 4.5, keep: true }, animatePhase1);
}

function animatePhase1(){
  var elem = switchPhases();
  elem.animo( { animation: 'fadeIn', duration: 2, keep: true }, function(){
    elem.animo( { animation: 'fadeOut', duration: 2, keep: true }, animatePhase2);
  });
}
function animatePhase2(){
  var elem = switchPhases();
  elem.animo( { animation: 'fadeIn', duration: 2, keep: true }, function(){
    elem.animo( { animation: 'fadeOut', duration: 2.5, keep: true }, animatePhase3);
  });
}
function animatePhase3(){
  var elem = switchPhases();
  elem.animo( { animation: 'fadeIn', duration: 2, keep: true }, function(){
    elem.animo( { animation: 'fadeOut', duration: 2.5, keep: true }, animatePhase4);
  });
}
function animatePhase4(){
  var elem = switchPhases();
  elem.animo( { animation: 'fadeIn', duration: 2, keep: true }, function(){
    elem.animo( { animation: 'fadeOut', duration: 2.5, keep: true }, animatePhase5);
  });
}
function animatePhase5(){
  var elem = switchPhases();
  elem.animo( { animation: 'fadeIn', duration: 2, keep: true }, function(){
    elem.animo( { animation: 'fadeOut', duration: 2.5, keep: true }, animatePhase6);
  });
}
function animatePhase6(){
  var elem = switchPhases();
  elem.animo( { animation: 'fadeIn', duration: 2, keep: true }, function(){
    elem.animo( { animation: 'fadeOut', duration: 2.5, keep: true }, animatePhase7);
  });
}
function animatePhase7(){
  var elem = switchPhases();
  elem.animo( { animation: 'fadeIn', duration: 2, keep: true }, function(){
    elem.animo( { animation: 'fadeOut', duration: 2.5, keep: true }, animatePhase8);
  });
}
function animatePhase8(){
  var elem = switchPhases();
  elem.animo( { animation: 'fadeIn', duration: 2, keep: true }, function(){
    elem.animo( { animation: 'fadeOut', duration: 2.5, keep: true }, animatePhase9);
  });
}
function animatePhase9(){
  var elem = switchPhases();
  $('#em-animation').css("background-color", "#FFFFFF");
  elem.animo( { animation: 'fadeIn', duration: 0.5, keep: true }, function(){
    elem.animo( { animation: 'fadeOut', duration: 3.5, keep: true }, animatePhase10);
  });
}
function animatePhase10(){
  var elem = switchPhases();
  elem.animo( { animation: 'fadeIn', duration: 2, keep: true }, function(){
    elem.animo( { animation: 'fadeOut', duration: 2.5, keep: true }, animatePhase11);
  });
}
function animatePhase11(){
  var elem = switchPhases();
  var createElem = $('#em-animation-11-create');
  var connectElem = $('#em-animation-11-connect');
  var careElem = $('#em-animation-11-care');

  createElem.removeClass('hidden');
  createElem.animo( { animation: 'fadeIn', duration: 1.2 }, function(){
    connectElem.removeClass('hidden');
    connectElem.animo( { animation: 'fadeIn', duration: 1.2 }, function(){
      careElem.removeClass('hidden');
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
  elem.animo( { animation: 'fadeIn', duration: 2, keep: true }, function(){
    elem.animo( { animation: 'fadeOut', duration: 2.5, keep: true }, animatePhase13);
  });
}
function animatePhase13(){
  var elem = switchPhases();

  var focusElem = $('#em-animation-13-focus');
  var organizeElem = $('#em-animation-13-organize');
  var storeElem = $('#em-animation-13-store');

  focusElem.removeClass('hidden');
  focusElem.animo( { animation: 'fadeIn', duration: 1.2, keep: true }, function(){
    organizeElem.removeClass('hidden');
    organizeElem.animo( { animation: 'fadeIn', duration: 1.2, keep: true }, function(){
      storeElem.removeClass('hidden');
      storeElem.animo( { animation: 'fadeIn', duration: 1.2, keep: true }, function(){
        focusElem.animo( { animation: 'fadeOut', duration: 1, keep: true });
        organizeElem.animo( { animation: 'fadeOut', duration: 1, keep: true });
        storeElem.animo( { animation: 'fadeOut', duration: 1, keep: true }, animatePhase14);
      });
    });
  });
}
function animatePhase14(){
  var elem = switchPhases();
  elem.animo( { animation: 'fadeIn', duration: 2, keep: true }, function(){
    elem.animo( { animation: 'fadeOutDown', duration: 2.5, keep: true }, animatePhase15);
  });
}
function animatePhase15(){
  var elem = switchPhases();
  elem.animo( { animation: 'fadeIn', duration: 2, keep: true }, function(){
    elem.animo( { animation: 'fadeOut', duration: 2.5, keep: true }, animatePhase16);
  });
}
function animatePhase16(){
  var elem = switchPhases();
  elem.animo( { animation: 'fadeIn', duration: 2, keep: true });

  var changeElem = $('#em-animation-16-change');
  var wayElem = $('#em-animation-16-way');
  var youElem = $('#em-animation-16-you');
  var thinkElem = $('#em-animation-16-think');

  changeElem.removeClass('hidden');
  changeElem.animo( { animation: 'fadeIn', duration: 0.8, keep: true }, function(){
    wayElem.removeClass('hidden');
    wayElem.animo( { animation: 'fadeIn', duration: 0.8, keep: true }, function(){
      youElem.removeClass('hidden');
      youElem.animo( { animation: 'fadeIn', duration: 0.8, keep: true }, function(){
        thinkElem.removeClass('hidden');
        thinkElem.animo( { animation: 'fadeIn', duration: 0.8, keep: true })
      });
    });
  });
}

