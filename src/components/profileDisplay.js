import React from "react";

const ProfileDisplay = ({ nickname, avatar }) => {
  return (
    <div>
      Никнейм: {nickname}
      <br />
      Аватар: {avatar}
    </div>
  );
};

export default ProfileDisplay;
