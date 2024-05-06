useEffect(() => {
    connectToServer();
  }, [profileData]);

  useEffect(() =>{
      if (localStorage.getItem(profileData)){
        if(JSON.parse(localStorage.getItem(profileData))){
          setProfileData(JSON.parse(localStorage.getItem(profileData)))
          console.log(profileData)
        }
      }
  })


  