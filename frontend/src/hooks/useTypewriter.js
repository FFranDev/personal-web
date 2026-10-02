import { useState, useEffect } from 'react';

export const useTypewriter = (baseText, suffixes, typingSpeed = 150, deletingSpeed = 50, pauseTime = 2000) => {
  const [text, setText] = useState(baseText);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const stableSuffixes = JSON.stringify(suffixes);

  // Start deleting state when language change
  useEffect(() => {
    setIsDeleting(true);
  }, [stableSuffixes]);

  // Recursive function to handle typing and deleting
  useEffect(() => {
    // Check if suffixes is defined and has elements
    const currentSuffixes = JSON.parse(stableSuffixes);
    if (!currentSuffixes || currentSuffixes.length === 0) return;

    let timer;
    const currentSuffix = currentSuffixes[loopNum % currentSuffixes.length];
    const fullText = baseText + currentSuffix;

    const handleTyping = () => {
      let nextText;
      
      if (isDeleting) {
        nextText = text.substring(0, text.length - 1);
      } else {
        nextText = fullText.substring(0, text.length + 1);
      }
      if (isDeleting && nextText.length <= baseText.length) {
        nextText = baseText;
      }
      
      setText(nextText);

      // Typing speed calculation
      let nextSpeed = isDeleting ? deletingSpeed : typingSpeed;

      // Check if the typing is complete
      if (!isDeleting && nextText === fullText) {
        nextSpeed = pauseTime; // Wait time before starting to delete
        setIsDeleting(true);
      } 
      // Check if the deleting is complete
      else if (isDeleting && nextText === baseText) {
        setIsDeleting(false);
        setLoopNum(loopNum + 1); // Next suffix
        nextSpeed = 500;
      }

      // Next type
      timer = setTimeout(handleTyping, nextSpeed);
    };

    // Start the typing effect
    timer = setTimeout(handleTyping, isDeleting ? deletingSpeed : typingSpeed);
    
    // Cleanup function to clear the timer when the component unmounts or dependencies change
    return () => clearTimeout(timer);
  }, [text, isDeleting, loopNum, stableSuffixes, baseText, typingSpeed, deletingSpeed, pauseTime]);

  return text;
};