 /*
  
    FUNCTION: setActive(clickedButton)
    This runs every time a sidebar button is clicked.
    It highlights the clicked button purple (active)
    and removes the purple highlight from all others.

  */
  function setActive(clickedButton) {
    const allSidebarItems = document.querySelectorAll('.sidebar-item');
    allSidebarItems.forEach(function(button) {
      button.classList.remove('active');
    });
    clickedButton.classList.add('active');
  }


  /*
    FUNCTION: triggerPhotoUpload()
    When the user clicks "Change Photo"

  */
  function triggerPhotoUpload() {

    const fileInput = document.getElementById('photoInput');
    fileInput.click();
  }


  /*
    FUNCTION: handlePhotoChange(event)
    This runs automatically when the user picks
    a file from the file dialog (because of the
    onchange attribute on the file input).

    HOW IT WORKS:
  Get the file the user chose
  Check the file is not too big (max 2MB)
  Use FileReader to read the image data
 Once read, update the <img> tag src
 so the new photo appears on screen
  */
  function handlePhotoChange(event) {

    const chosenFile = event.target.files[0];

 
    if (!chosenFile) {
      return;
    }

    // Check the file size
    // file.size is in bytes, so we multiply to get 2MB in bytes:
    // 2 * 1024 * 1024 = 2,097,152 bytes = 2MB
    const maxSizeInBytes = 2 * 1024 * 1024;

    if (chosenFile.size > maxSizeInBytes) {
      showToast('Image must be under 2MB. Please choose a smaller file.');
      return;
    }

    const reader = new FileReader();

    /*
      reader.onload is an event handler.
      It runs automatically AFTER the file has been fully read.
      "ev" is the event that contains the file data.
    */
    reader.onload = function(ev) {

      const newImageSrc = ev.target.result;

      document.getElementById('profilePhoto').src = newImageSrc;

      document.querySelector('.nav-avatar img').src = newImageSrc;

      // Let the user know it worked
      showToast('Profile photo updated successfully!');
    };

    reader.readAsDataURL(chosenFile);
  }


  /*
    FUNCTION: saveChanges()
   
    This runs when the user clicks "Save Changes".

  */
  function saveChanges() {

    const firstName = document.getElementById('firstName').value.trim();
    const lastName  = document.getElementById('lastName').value.trim();
    const email     = document.getElementById('email').value.trim();
    const phone     = document.getElementById('phone').value.trim();

    if (firstName === '' || lastName === '' || email === '') {
      showToast('Please fill in your first name, last name, and email.');
      return; 
    }

 
    const saveBtn = document.getElementById('saveBtn');

    saveBtn.disabled = true;

    // Change the button text to show something is happening
    saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

    setTimeout(function() {

      // Re-enable the button after the "save" completes
      saveBtn.disabled = false;

      // Restore the original button text and icon
      saveBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save Changes';

      // Show a success message to the user
      showToast('Your changes have been saved successfully!');

    }, 1000);
  }


  /*
    FUNCTION: showToast(message)

    Shows a small popup notification at the
    bottom-right corner of the screen.

    The "clearTimeout" at the start makes sure
    that if showToast is called again before the
    3 seconds are up, it resets the timer
    (so the toast doesn't disappear too early).
   
  */
  function showToast(message) {

    const toastElement = document.getElementById('toast');

    toastElement.textContent = message;

    toastElement.classList.add('show');


    clearTimeout(toastElement._timer);

  
  
    toastElement._timer = setTimeout(function() {

     
      toastElement.classList.remove('show');

    }, 3000); 
  }

