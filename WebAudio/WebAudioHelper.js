/**
 *  Copyright 2011 Munkadoo Games LLC
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

/**
 * Create a new SoundEffect object from a source URL. This object can be played,
 * paused, stopped, and resumed, like the HTML5 Audio element.
 *
 * @constructor
 * @param {DOMString} src
 * @param {boolean=} opt_autoplay
 * @param {boolean=} opt_loop
 */
SoundEffect = function(src, opt_autoplay, opt_loop) {

  // At construction time, the SoundEffect is not paused or playing (stopped),
  // and has no offset recorded.
  this.playing_ = false;
  this.startTime_ = 0;
  this.loop_ = opt_loop ? true : false;

  // Create an XHR to load the audio data.
  var request = new XMLHttpRequest();
  request.open("GET", src, true);
  request.responseType = "arraybuffer";

  var sfx = this;
  request.onload = function() {
    // When audio data is ready, we create a WebAudio buffer from the data.
    sfx.buffer_ = SoundEffect.context.createBuffer(request.response, true);
    
    if (opt_autoplay) {
      sfx.play();
    }
  }

  request.send();
}

// Create a global context for all our SoundEffects to use and attach it to the
// base object.
SoundEffect.context = new webkitAudioContext();

/**
 * Recreates the audio graph. Each source can only be played once (bug?), so
 * we must recreate the source each time we want to play.
 */
SoundEffect.prototype.createGraph = function() {
  this.source_ = SoundEffect.context.createBufferSource();
  this.source_.buffer = this.buffer_;
  this.source_.connect(SoundEffect.context.destination);

  // Looping is handled by the Web Audio API.
  this.source_.loop = this.loop_;
}

/**
* Plays the given SoundEffect.
*/
SoundEffect.prototype.play = function() {
  if (this.buffer_ && !this.playing_) {
    // Record the start time so we know how long we've been playing.
    this.startTime_ = SoundEffect.context.currentTime;
    this.playing_ = true;
    this.createGraph();
    this.source_.noteOn(0);
  }
}

/**
* Stops a sound effect, resetting its seek position to 0.
*/
SoundEffect.prototype.stop = function() {
  if (this.playing_) {
    this.source_.noteOff(0);
  }

  this.playing_ = false;
  this.startTime_ = 0;
}

/**
* Indicates whether the sound is playing.
* @return {boolean}
*/
SoundEffect.prototype.isPlaying = function() {
  var playTime = (SoundEffect.context.currentTime - this.startTime_);

  return this.playing_ && (playTime < this.buffer_.duration);
}