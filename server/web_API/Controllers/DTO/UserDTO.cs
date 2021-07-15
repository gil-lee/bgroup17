using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace web_API.DTO
{
    public class UserDTO
    {
        public int id;
        public string firstName;
        public string lastName;
        public int phoneNumber;
        public string email;
        public string password;
        public string profilePicture;
        public string residence;
        public int radius;
        public DateTime? birthDate;
        public string itemViewingMethod;
    }
}