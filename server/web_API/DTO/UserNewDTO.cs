using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace web_API.DTO
{
    public class UserNewDTO
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
        public int avatarlevel;
        public int dailySentenceId;
        public string showItemsFeed;
        public int numOfPoints;
        public int numOfItems;
        public string location;

        public string userToken;

        public List<UserItemsDTO> UserItemsListDTO;
        public List<UserFilterDTO> UserFilterListDTO;
        //public List<FavoriteUsersDTO> favoriteUsersDTO;
       
    }
}