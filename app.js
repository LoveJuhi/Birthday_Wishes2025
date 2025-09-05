// Global variables
let currentLevel = 1
let confettiInterval
let audio

// Initialize the application when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  initializeApp()
})

// Initialize all app functionality
function initializeApp() {
  setupAudio()
  startConfetti()
  setupFormSubmission()

  // Show initial level
  showLevel(1)

  // Setup volume slider
  const volumeSlider = document.getElementById("volume-slider")
  if (volumeSlider) {
    volumeSlider.addEventListener("input", function () {
      if (audio) {
        audio.volume = this.value / 100
      }
    })
  }

  // Fix button click handlers
  setupButtonHandlers()
}

// Setup button click handlers
function setupButtonHandlers() {
  // Add event listeners to all navigation buttons
  document.addEventListener("click", function (e) {
    if (
      e.target.classList.contains("btn-next") ||
      e.target.closest(".btn-next")
    ) {
      const button = e.target.classList.contains("btn-next")
        ? e.target
        : e.target.closest(".btn-next")
      handleNextButton(button, e)
    }

    if (
      e.target.classList.contains("btn-restart") ||
      e.target.closest(".btn-restart")
    ) {
      e.preventDefault()
      startOver()
    }

    if (
      e.target.classList.contains("btn-quiz-option") ||
      e.target.closest(".btn-quiz-option")
    ) {
      e.preventDefault()
      answerQuiz()
    }
  })
}

// Handle next button clicks
function handleNextButton(button, event) {
  event.preventDefault()

  // Determine which level we're going to based on current level
  if (currentLevel === 1) {
    nextLevel(2)
  } else if (currentLevel === 2) {
    nextLevel(3)
  } else if (currentLevel === 3) {
    // Handle form submission for level 3
    handleWishesFormSubmission()
  } else if (currentLevel === 4) {
    nextLevel(5)
  }
}

// Audio functionality
function setupAudio() {
  audio = document.getElementById("birthday-music")
  if (audio) {
    // Set initial volume
    audio.volume = 0.5

    // Try to autoplay (browsers may block this)
    const playPromise = audio.play()
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          updatePlayButton(true)
        })
        .catch((error) => {
          console.log("Autoplay was prevented")
          updatePlayButton(false)
        })
    }
  }
}

function toggleMusic() {
  const playIcon = document.getElementById("play-icon")

  if (audio && audio.paused) {
    audio
      .play()
      .then(() => {
        updatePlayButton(true)
      })
      .catch((error) => {
        console.error("Error playing audio:", error)
      })
  } else if (audio) {
    audio.pause()
    updatePlayButton(false)
  }
}

function updatePlayButton(isPlaying) {
  const playIcon = document.getElementById("play-icon")
  if (playIcon) {
    playIcon.className = isPlaying ? "fas fa-pause" : "fas fa-play"
  }
}

// Enhanced confetti animation
function startConfetti() {
  const container = document.getElementById("confetti-container")
  if (!container) return

  const colors = [
    "confetti-pink",
    "confetti-purple",
    "confetti-gold",
    "confetti-white",
  ]

  function createConfetti() {
    const confetti = document.createElement("div")
    confetti.className = `confetti ${
      colors[Math.floor(Math.random() * colors.length)]
    }`

    // Random horizontal position
    confetti.style.left = Math.random() * 100 + "vw"

    // Random animation duration (3-6 seconds)
    const duration = Math.random() * 3 + 3 + "s"
    confetti.style.animationDuration = duration

    // Random delay
    confetti.style.animationDelay = Math.random() * 2 + "s"

    container.appendChild(confetti)

    // Remove confetti after animation
    setTimeout(() => {
      if (confetti.parentNode) {
        confetti.parentNode.removeChild(confetti)
      }
    }, 8000)
  }

  // Create confetti periodically
  confettiInterval = setInterval(createConfetti, 200)

  // Create initial burst
  for (let i = 0; i < 30; i++) {
    setTimeout(createConfetti, i * 50)
  }
}

// Level management
function showLevel(levelNumber) {
  // Hide all levels
  const allLevels = document.querySelectorAll(".level")
  allLevels.forEach((level) => {
    level.classList.remove("active")
  })

  // Show target level with animation
  const targetLevel = document.getElementById(`level-${levelNumber}`)
  if (targetLevel) {
    setTimeout(() => {
      targetLevel.classList.add("active")
    }, 100)
  }

  currentLevel = levelNumber
}

function nextLevel(levelNumber) {
  // Add exit animation to current level
  const currentLevelElement = document.getElementById(`level-${currentLevel}`)
  if (currentLevelElement) {
    currentLevelElement.style.animation = "slideOut 0.3s ease-out forwards"
  }

  // Show next level after animation
  setTimeout(() => {
    showLevel(levelNumber)
  }, 300)
}

// Fixed form submission for wishes
function setupFormSubmission() {
  const wishesForm = document.getElementById("wishes-form")
  if (wishesForm) {
    wishesForm.addEventListener("submit", function (e) {
      e.preventDefault()
      handleWishesFormSubmission()
    })
  }
}

function handleWishesFormSubmission() {
  // Get form data directly from inputs
  const wish1Input = document.querySelector('input[name="wish1"]')
  const wish2Input = document.querySelector('input[name="wish2"]')
  const wish3Input = document.querySelector('input[name="wish3"]')

  if (!wish1Input || !wish2Input || !wish3Input) {
    console.error("Could not find wish input fields")
    return
  }

  const wish1 = wish1Input.value.trim()
  const wish2 = wish2Input.value.trim()
  const wish3 = wish3Input.value.trim()

  // Validate wishes
  if (!wish1 || !wish2 || !wish3) {
    // Add error animation to empty fields
    ;[wish1Input, wish2Input, wish3Input].forEach((input) => {
      if (!input.value.trim()) {
        input.classList.add("error")
        input.focus()
        setTimeout(() => {
          input.classList.remove("error")
        }, 1000)
      }
    })

    // Show error message
    showMessage("Please fill in all three wishes! 💖", "error")
    return
  }
  // Email Integration using FormSubmit.co
  const formData = new FormData(document.getElementById("wishes-form"))

  fetch("https://formsubmit.co/969db4d3754794ee99c5e23b8134d184", {
    method: "POST",
    body: formData,
  })
    .then((res) => console.log(res.status))
    .then((data) => console.log("Success:", data))
    .catch((err) => console.error("Error:", err))

  // Show success message
  showMessage("Your wishes have been delivered to your soulmate! 💕", "success")

  // Proceed to next level
  setTimeout(() => {
    nextLevel(4)
  }, 1500)
}

// Enhanced message display function
function showMessage(message, type = "success") {
  // Remove any existing messages
  const existingMessage = document.querySelector(".temp-message")
  if (existingMessage) {
    existingMessage.remove()
  }

  const messageDiv = document.createElement("div")
  messageDiv.className = "temp-message alert text-center"
  messageDiv.style.position = "fixed"
  messageDiv.style.top = "20px"
  messageDiv.style.left = "50%"
  messageDiv.style.transform = "translateX(-50%)"
  messageDiv.style.zIndex = "9999"
  messageDiv.style.borderRadius = "15px"
  messageDiv.style.padding = "15px 25px"
  messageDiv.style.fontSize = "1.1rem"
  messageDiv.style.fontWeight = "600"
  messageDiv.style.minWidth = "300px"
  messageDiv.style.boxShadow = "0 4px 15px rgba(0,0,0,0.1)"

  if (type === "success") {
    messageDiv.style.background = "linear-gradient(135deg, #FFB6C1, #FFC0CB)"
    messageDiv.style.color = "white"
    messageDiv.style.border = "none"
  } else {
    messageDiv.style.background = "linear-gradient(135deg, #FF6B6B, #FF8E8E)"
    messageDiv.style.color = "white"
    messageDiv.style.border = "none"
  }

  messageDiv.innerHTML = message
  document.body.appendChild(messageDiv)

  // Animate in
  messageDiv.style.animation = "fadeIn 0.5s ease-in"

  // Remove after delay
  setTimeout(() => {
    messageDiv.style.animation = "fadeOut 0.5s ease-out"
    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.parentNode.removeChild(messageDiv)
      }
    }, 500)
  }, 2000)
}

// Quiz functionality
function answerQuiz() {
  // Hide the question area
  const questionArea = document.getElementById("quiz-question")
  const resultArea = document.getElementById("quiz-result")

  if (questionArea && resultArea) {
    // Add exit animation to question
    questionArea.style.animation = "slideOut 0.3s ease-out forwards"

    // Show result after animation
    setTimeout(() => {
      questionArea.style.display = "none"
      resultArea.style.display = "block"
      resultArea.style.animation = "fadeIn 0.6s ease-in"

      // Add extra heart effects
      createHeartBurst()
    }, 300)
  }
}

function createHeartBurst() {
  const hearts = ["💖", "💕", "💓", "💗", "💝"]
  const container = document.querySelector(".quiz-result")

  if (!container) return

  for (let i = 0; i < 10; i++) {
    const heart = document.createElement("div")
    heart.innerHTML = hearts[Math.floor(Math.random() * hearts.length)]
    heart.style.position = "absolute"
    heart.style.fontSize = "1.5rem"
    heart.style.left = Math.random() * 80 + 10 + "%"
    heart.style.top = Math.random() * 80 + 10 + "%"
    heart.style.animation = "heartFloat 2s ease-out forwards"
    heart.style.pointerEvents = "none"
    heart.style.zIndex = "1000"

    container.style.position = "relative"
    container.appendChild(heart)

    // Remove heart after animation
    setTimeout(() => {
      if (heart.parentNode) {
        heart.parentNode.removeChild(heart)
      }
    }, 2000)
  }
}

// Start over functionality
function startOver() {
  // Add a nice transition effect before reload
  const card = document.querySelector(".birthday-card")
  if (card) {
    card.style.animation = "fadeOut 0.5s ease-out"
    setTimeout(() => {
      location.reload()
    }, 500)
  } else {
    location.reload()
  }
}

// Add dynamic styles for animations
function addDynamicStyles() {
  const style = document.createElement("style")
  style.textContent = `
        @keyframes heartFloat {
            0% {
                opacity: 1;
                transform: translateY(0) scale(0.5);
            }
            100% {
                opacity: 0;
                transform: translateY(-100px) scale(1.5);
            }
        }
        
        @keyframes fadeOut {
            from { opacity: 1; transform: scale(1); }
            to { opacity: 0; transform: scale(0.9); }
        }
        
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
        
        .temp-message {
            animation: fadeIn 0.5s ease-in !important;
        }
    `
  document.head.appendChild(style)
}

// Initialize dynamic styles
document.addEventListener("DOMContentLoaded", addDynamicStyles)

// Enhanced input field handling
document.addEventListener("DOMContentLoaded", function () {
  const wishInputs = document.querySelectorAll(".wish-input")
  wishInputs.forEach((input) => {
    // Ensure inputs are properly initialized
    input.addEventListener("focus", function () {
      this.style.transform = "scale(1.02)"
      this.style.transition = "transform 0.2s ease"
      this.style.outline = "none"
      this.style.borderColor = "#FF69B4"
    })

    input.addEventListener("blur", function () {
      this.style.transform = "scale(1)"
      this.style.borderColor = "#FFB6C1"
    })

    // Add input validation
    input.addEventListener("input", function () {
      if (this.value.trim().length > 0) {
        this.classList.remove("error")
        this.style.borderColor = "#FFB6C1"
      }
    })
  })

  // Fix caption input as well
  const captionInput = document.querySelector(".caption-input")
  if (captionInput) {
    captionInput.addEventListener("focus", function () {
      this.style.borderColor = "#FF69B4"
      this.style.outline = "none"
    })

    captionInput.addEventListener("blur", function () {
      this.style.borderColor = "#FFB6C1"
    })
  }
})

// Enhanced button interactions
document.addEventListener("DOMContentLoaded", function () {
  const buttons = document.querySelectorAll(
    ".btn-next, .btn-restart, .btn-quiz-option"
  )
  buttons.forEach((button) => {
    button.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-2px)"
      this.style.transition = "all 0.2s ease"
    })

    button.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0)"
    })

    button.addEventListener("mousedown", function () {
      this.style.transform = "translateY(0)"
    })

    button.addEventListener("click", function (e) {
      // Create ripple effect
      const rect = this.getBoundingClientRect()
      const ripple = document.createElement("span")
      ripple.style.position = "absolute"
      ripple.style.borderRadius = "50%"
      ripple.style.background = "rgba(255, 255, 255, 0.6)"
      ripple.style.transform = "scale(0)"
      ripple.style.animation = "ripple 0.6s linear"
      ripple.style.left = e.clientX - rect.left - 10 + "px"
      ripple.style.top = e.clientY - rect.top - 10 + "px"
      ripple.style.width = ripple.style.height = "20px"
      ripple.style.pointerEvents = "none"

      this.style.position = "relative"
      this.style.overflow = "hidden"
      this.appendChild(ripple)

      setTimeout(() => {
        if (ripple.parentNode) {
          ripple.remove()
        }
      }, 600)
    })
  })
})

// Keyboard navigation support
document.addEventListener("keydown", function (e) {
  if (e.key === "Enter" && !e.shiftKey) {
    const activeElement = document.activeElement

    // If user is in a wish input and it's the last one, submit form
    if (activeElement && activeElement.classList.contains("wish-input")) {
      if (activeElement.name === "wish3") {
        handleWishesFormSubmission()
      }
      return
    }

    // Find the next button in the current active level
    const activeLevel = document.querySelector(".level.active")
    if (activeLevel) {
      const nextButton = activeLevel.querySelector(".btn-next, .btn-restart")
      if (nextButton && !nextButton.disabled) {
        nextButton.click()
      }
    }
  }
})

// Performance optimization: Clean up intervals on page unload
window.addEventListener("beforeunload", function () {
  if (confettiInterval) {
    clearInterval(confettiInterval)
  }
  if (audio) {
    audio.pause()
  }
})
