using System;
using System.Collections.Generic;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using DATA;
using web_API.DTO;

namespace web_API.Controllers
{
    public class FavoriteUsersController : ApiController
    {
        // GET api/<controller>
        [HttpGet]
        [Route("api/FavoriteUsers/GetFavoriteList/{userLG}/")]
        public List<FavoriteUsersDTO> GetFavoriteList(string userLG)
        {
            swishDBContext db = new swishDBContext();

            var user = db.S_FavoriteUsers.Where(y => y.emailLGUser == userLG).Select(x => new FavoriteUsersDTO()
            {
                id = x.id,
                emailLGUser = x.emailLGUser,
                emailFavUser = x.emailFavUser
            }).ToList();


            return user;
        }

        [HttpGet]
        [Route("api/FavoriteUsers/FavoriteItemUsersGet/{userEmail}/")]
        public List<UserItemsDTO> FavoriteItemUsersGet(string userEmail)
        {
            swishDBContext db = new swishDBContext();


            List<FavoriteUsersDTO> userItem = db.S_FavoriteUsers.Where(x => x.emailLGUser == userEmail).Select(u => new FavoriteUsersDTO()
            {
                emailFavUser = u.emailFavUser,
                emailLGUser = u.emailLGUser

            }).ToList();

            UserNewController user = new UserNewController();
            List<UserItemsDTO> userNew = user.UsersListGet(userEmail);

            List<UserItemsDTO> FavoriteItemUsers = new List<UserItemsDTO>();

            foreach (var x in userNew)
            {
                foreach (var i in userItem)
                {
                    if (i.emailFavUser == x.email)
                    {
                        FavoriteItemUsers.Add(x);
                    }
                }
            }
            return FavoriteItemUsers;
        }

        [HttpGet]
        [Route("api/FavoriteUsers/FavoriteUsersGet/{userEmail}/")]
        public List<UserNewDTO> FavoriteUsersGet(string userEmail)
        {
            swishDBContext db = new swishDBContext();
            var user = db.S_User_New.Where(u => u.email == userEmail).Select(x => new UserNewDTO()
            {
                id = x.id,
                firstName = x.firstName,
                lastName = x.lastName,
                email = x.email,
                profilePicture = x.profilePicture,
                phoneNumber = x.phoneNumber,
                residence = x.residence,
                radius = x.radius,
                numOfItems = x.S_User_Items.Count,
            }).ToList();

            return user;
        }

        // POST api/<controller>
        [HttpPost]
        [Route("api/FavoriteUsers/PostFavorite")]
        public HttpResponseMessage PostFavorite(FavoriteUsersDTO favoriteUsersDTO)
        {
            swishDBContext db = new swishDBContext();
            S_FavoriteUsers f = new S_FavoriteUsers();


            var fa = db.S_FavoriteUsers.SingleOrDefault(x => x.emailLGUser == favoriteUsersDTO.emailLGUser && x.emailFavUser == favoriteUsersDTO.emailFavUser);
            if (fa != null)
            {
                return Request.CreateResponse(HttpStatusCode.NotImplemented, "המשתמש קיים ברשימת האוהבים שלך");
            }
            else
            {
                f.id = favoriteUsersDTO.id;
                f.emailLGUser = favoriteUsersDTO.emailLGUser;
                f.emailFavUser = favoriteUsersDTO.emailFavUser;

                try
                {
                    db.S_FavoriteUsers.Add(f);
                    db.SaveChanges();
                }
                catch (Exception ex) //שגיאה כללית
                {
                    return Request.CreateResponse(HttpStatusCode.NotImplemented, "שגיאה כללית");
                }
                return Request.CreateResponse(HttpStatusCode.OK, "משתמש שאהבתי נוסף בהצלחה");
            }
        }



        // DELETE api/<controller>/5
        [HttpDelete]
        [Route("api/FavoriteUsers/DeleteFav")]
        public HttpResponseMessage DeleteFav(FavoriteUsersDTO favoriteUsersDto)
        {
            swishDBContext db = new swishDBContext();
            var row = db.S_FavoriteUsers.Where(y => y.emailLGUser == favoriteUsersDto.emailLGUser && y.emailFavUser == favoriteUsersDto.emailFavUser).FirstOrDefault();

            if (row != null)
            {
                db.S_FavoriteUsers.Remove(row);

                try
                {
                    db.SaveChanges();
                }
                catch (Exception ex) //שגיאה כללית
                {
                    return Request.CreateResponse(HttpStatusCode.NotImplemented, "שגיאה כללית");
                }
                return Request.CreateResponse(HttpStatusCode.OK, "משתמש שאהבת הוסר מרשימת האהובים");
            }
            return Request.CreateResponse(HttpStatusCode.OK, "לא נמצא משתמש למחיקה");

        }
    }
}