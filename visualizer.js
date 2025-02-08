function getCSSVariableValue(variableName) {
  // Use getComputedStyle to access the computed styles of the root element (HTML)
  return getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
}

const color1Value = getCSSVariableValue('--color55');
console.log("The value of --color1 is:", color1Value);

const color2Value = getCSSVariableValue('--color66');
console.log("The value of --color1 is:", color2Value);
  

// Fetch JSON with predefined positions
fetch('positions.json')
  .then(response => response.json())
  .then(positionData => {
    // Get all the position sets (e.g., position1, position2, etc.)
    const positionSets = Object.keys(positionData);

    // Randomly pick one position set
    const randomPositionSetKey = positionSets[Math.floor(Math.random() * positionSets.length)];
    const randomPositionSet = positionData[randomPositionSetKey];

    // Select all the .projekt divs
    const divs = document.querySelectorAll('.projekt:not(#impressum-span)');

    divs.forEach((div, index) => {
      const { left, top } = randomPositionSet[index];
    
      // Set the div's position to absolute
      div.style.position = 'absolute';
    
      // Get the parent container's width and height (assuming the parent is 'container')
      const container = div.parentElement;
      const containerWidth = container.offsetWidth;
      const containerHeight = container.offsetHeight;
    
      // Convert the percentage values to pixels
      const targetX = (left / 100) * containerWidth;
      const targetY = (top / 100) * containerHeight;
    
      // Get the div's width and height in pixels
      const divWidth = div.offsetWidth;
      const divHeight = div.offsetHeight;
    
      // Calculate the center position by subtracting half of the div's width and height
      const centerX = targetX - (divWidth / 2);
      const centerY = targetY - (divHeight / 2);
    
      // Apply the calculated position in pixels
      div.style.left = `${(centerX / containerWidth) * 100}%`;  // Convert back to percentage
      div.style.top = `${(centerY / containerHeight) * 100}%`;  // Convert back to percentage
    });
    
    

    // Ensure divs are positioned before connecting them
    requestAnimationFrame(() => {
      connectDivs(divs); // Connect the divs after they are positioned
    });
  })
  .catch(error => {
    console.error('Error fetching positions:', error);
  });


// Function to get the center of each div
function getDivCenter(div) {
  const rect = div.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2, // Calculate center X based on width
    y: rect.top + rect.height / 2  // Calculate center Y based on height
  };
}

// Function to create a wavy path between two points with animation
function createWavyPath(x1, y1, x2, y2, delayIndex) {
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  const controlPoint1 = {
    x: (x1 + x2) / 2 + (Math.random() - 0.5) * 400, // Randomize control points for the wavy effect
    y: y1 + (Math.random() - 0.5) * 400
  };
  const controlPoint2 = {
    x: (x1 + x2) / 2 + (Math.random() - 0.5) * 400,
    y: y2 + (Math.random() - 0.5) * 400
  };

  const pathData = `M ${x1} ${y1} 
                    C ${controlPoint1.x} ${controlPoint1.y}, 
                      ${controlPoint2.x} ${controlPoint2.y}, 
                      ${x2} ${y2}`;

  path.setAttribute("d", pathData);
  path.setAttribute("stroke", "black"); // Set stroke color
  path.setAttribute("stroke-width", "0.6");
  path.setAttribute("fill", "none"); // No fill for the path

  const pathLength = path.getTotalLength();
  path.style.strokeDasharray = pathLength;  // Set dash array to match the length of the path
  path.style.strokeDashoffset = pathLength; // Start the path hidden (offset by full length)
  path.style.opacity = "0.5"; // Set initial opacity to 0.5 during the animation

  // Add CSS animation for drawing the path
  path.style.animation = `draw 4s ease forwards, fadeIn 4s ease forwards`; // Animate the stroke and opacity
  path.style.animationDelay = `${delayIndex * 0.8}s`; // Stagger the animation delay

  // Once the drawing animation is finished, keep the path dashed and transition opacity to 1
  path.addEventListener('animationend', () => {
    path.style.strokeDasharray = "5, 5"; // Set the path to be dashed after animation
    path.style.opacity = "1"; 
  });

  return path;
}


// Function to create connections between divs using the wavy paths
function connectDivs(divs) {
  const svg = document.querySelector("svg"); // Assuming you have an SVG element to append paths to
  divs.forEach((div1, index1) => {
    divs.forEach((div2, index2) => {
      if (index1 < index2) { // Only connect each pair once
        const center1 = getDivCenter(div1);
        const center2 = getDivCenter(div2);
        const path = createWavyPath(center1.x, center1.y, center2.x, center2.y, index1);
        svg.appendChild(path);
      }
    });
  });
}









  
  // let resizeTimeout;
  // window.addEventListener('resize', function() {
  //     clearTimeout(resizeTimeout);
  //     resizeTimeout = setTimeout(connectDivs(divs), dotGrid1, 200);
  // });





  let currentAudio = null;
  let currentButton = null;
  const titleSpan = document.querySelector('#title'); // Select the #title span
  
  // Function to handle play button clicks
  function handlePlayButtonClick(event) {
    const button = event.target.closest('.play-button');
    if (!button) return;
  
    const projektDiv = button.closest('.projekt');
    const audio = projektDiv.querySelector('audio');
    const progressBar = projektDiv.querySelector('.progress-bar');
    const progressDot = projektDiv.querySelector('.progress-dot');
    
    // Check if the clicked button's audio is currently playing
    if (audio !== currentAudio) {
      // Pause previous audio if any, reset the previous button
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentButton.classList.remove('pause');
        titleSpan.classList.remove('playing'); // Remove the 'playing' class
      }
  
      // Play the new audio
      audio.play();
      button.classList.add('pause');
      titleSpan.classList.add('playing'); // Add the 'playing' class
      currentAudio = audio;
      currentButton = button;
    } else {
      // Pause or resume the current audio
      if (!audio.paused) {
        audio.pause();
        button.classList.remove('pause');
        titleSpan.classList.remove('playing'); // Remove the 'playing' class when paused
      } else {
        audio.play();
        button.classList.add('pause');
        titleSpan.classList.add('playing'); // Add the 'playing' class when resumed
      }
    }
  
    // Update progress bar and dot as the audio plays
    audio.addEventListener('timeupdate', function () {
      const progress = (audio.currentTime / audio.duration) * 100;
      progressBar.style.width = `${progress}%`;
      progressDot.style.left = `${progress}%`;
    });
  
    // Reset when the audio ends
    audio.addEventListener('ended', function () {
      progressBar.style.width = '0%';
      progressDot.style.left = '0%';
      button.classList.remove('pause');
      titleSpan.classList.remove('playing'); // Remove the 'playing' class when ended
    });
  
    // Make the progress bar draggable
    makeProgressBarDraggable(projektDiv, audio, progressBar, progressDot);
  }
  
  // Function to handle restart button clicks
  function handleRestartButtonClick(event) {
    const button = event.target.closest('.restart-button');
    if (!button) return;
  
    const projektDiv = button.closest('.projekt');
    const audio = projektDiv.querySelector('audio');
    const playButton = projektDiv.querySelector('.play-button');
    const progressBar = projektDiv.querySelector('.progress-bar');
    const progressDot = projektDiv.querySelector('.progress-dot');
  
    // Reset and play the current audio
    audio.currentTime = 0;
    audio.play();
    titleSpan.classList.add('playing'); // Add 'playing' class on restart
    currentAudio = audio;
    currentButton = playButton;
  
    // Update progress as the audio plays
    audio.addEventListener('timeupdate', function () {
      const progress = (audio.currentTime / audio.duration) * 100;
      progressBar.style.width = `${progress}%`;
      progressDot.style.left = `${progress}%`;
    });
  
    // Reset progress bar and dot when audio ends
    audio.addEventListener('ended', function () {
      progressBar.style.width = '0%';
      progressDot.style.left = '0%';
      playButton.classList.remove('pause');
      titleSpan.classList.remove('playing'); // Remove 'playing' class when audio ends
    });

  // Make the progress bar draggable
  makeProgressBarDraggable(projektDiv, audio, progressBar, progressDot);
}

// Function to handle restart button clicks
function handleRestartButtonClick(event) {
  const button = event.target.closest('.restart-button');
  if (!button) return;

  const projektDiv = button.closest('.projekt');
  const audio = projektDiv.querySelector('audio');
  const playButton = projektDiv.querySelector('.play-button');
  const progressBar = projektDiv.querySelector('.progress-bar');
  const progressDot = projektDiv.querySelector('.progress-dot');

  // Reset and play the current audio
  audio.currentTime = 0;
  currentAudio = audio;
  currentButton = playButton;

  // Update progress as the audio plays
  audio.addEventListener('timeupdate', function () {
    const progress = (audio.currentTime / audio.duration) * 100;
    progressBar.style.width = `${progress}%`;
    progressDot.style.left = `${progress}%`;
  });

  // Reset progress bar and dot when audio ends
  audio.addEventListener('ended', function () {
    progressBar.style.width = '0%';
    progressDot.style.left = '0%';
    playButton.classList.remove('pause');
  });
}

function handleCloseButtonClick(event) {
  const button = event.target.closest('.close-button');
  if (!button) return;

  const projektDiv = button.closest('.projekt');
  const audio = projektDiv.querySelector('audio');

  // Stop the audio and reset it to the beginning
  if (audio) {
    audio.pause();
    audio.currentTime = 0; // Reset audio to the start
  }

  // Reset the progress bar and play button
  const playButton = projektDiv.querySelector('.play-button');
  const progressBar = projektDiv.querySelector('.progress-bar');
  const progressDot = projektDiv.querySelector('.progress-dot');
  
  if (progressBar && progressDot) {
    progressBar.style.width = '0%';
    progressDot.style.left = '0%';
  }

  if (playButton) {
    playButton.classList.remove('pause'); // Reset the play button state
  }

  // Scroll to top and delay removing 'clicked' class from all projekt divs
  document.querySelectorAll('.projekt').forEach(function (projekt) {
    const projektHidden = projekt.querySelector('.projekt-hidden');
    
    // Scroll to the top of the hidden div
    projektHidden.scrollTop = 0;

    // Add delay for smooth transition, then remove 'clicked' class
    setTimeout(() => {
      projekt.classList.remove('clicked');
    }, 300); // Adjust this value if necessary (in ms)
  });

  // Reset current audio and button variables
  currentAudio = null;
  currentButton = null;

  event.stopPropagation(); // Prevent further propagation of the click event
}



// Function to make the progress bar draggable
function makeProgressBarDraggable(projektDiv, audio, progressBar, progressDot) {
  const progressContainer = projektDiv.querySelector('.progress');
  let isDragging = false;

  function updateProgress(e) {
    const rect = progressContainer.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const newTime = (offsetX / rect.width) * audio.duration;
    audio.currentTime = newTime;

    // Update progress bar and dot
    const progress = (audio.currentTime / audio.duration) * 100;
    progressBar.style.width = `${progress}%`;
    progressDot.style.left = `${progress}%`;
  }

  // Handle dragging on the progress bar and dot
  progressContainer.addEventListener('click', updateProgress);
  progressDot.addEventListener('mousedown', function () {
    isDragging = true;
  });

  window.addEventListener('mousemove', function (e) {
    if (isDragging) {
      updateProgress(e);
    }
  });

  window.addEventListener('mouseup', function () {
    isDragging = false;
  });
}

// Event delegation for all buttons
document.addEventListener('click', function (event) {
  if (event.target.matches('.play-button')) {
    handlePlayButtonClick(event);
  } else if (event.target.matches('.restart-button')) {
    handleRestartButtonClick(event);
  } else if (event.target.matches('.close-button')) {
    handleCloseButtonClick(event);
  }
});



const projekts = document.querySelectorAll('.projekt');

projekts.forEach(function(projekt) {
    projekt.addEventListener('click', function() {
        projekts.forEach(function(proj) {
            if (proj.classList.contains('clicked')) {
                const projektHidden = proj.querySelector('.projekt-hidden');
                
                // Scroll the div to the top
                projektHidden.scrollTop = 0;

            }
        });

        // Add the 'clicked' class to the clicked div
        projekt.classList.add('clicked');
    });
});




