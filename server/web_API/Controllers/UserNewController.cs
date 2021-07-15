using System;
using System.Collections.Generic;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using DATA;
using Newtonsoft.Json;
using web_API.DTO;

namespace web_API.Controllers
{
    // [RoutePrefix ("api/UserNew")]
    public class UserNewController : ApiController //קונטרולר האחראי על הבאת כלל המשתמשים הקיימים בDB
    {
        // GET api/<controller>

        public List<UserNewDTO> Get() //הבאת כל המשתמשים מהDB
        {
            swishDBContext db = new swishDBContext();

            var user = db.S_User_New.Select(x => new UserNewDTO()
            {
                id = x.id,
                firstName = x.firstName,
                lastName = x.lastName,
                email = x.email,
                password = x.password,
                profilePicture = x.profilePicture,
                phoneNumber = x.phoneNumber,
                residence = x.residence,
                radius = x.radius,
                birthDate = x.birthDate,
                avatarlevel = (int)x.avatarlevel,
                numOfPoints = x.numOfPoints,
                showItemsFeed = x.showItemsFeed,
                numOfItems = x.S_User_Items.Count,

            }).ToList();
            return user;
        }

        [HttpGet]
        [Route("api/UserNew/logIn/{userEmail}/{userPassword}")] //הבאת כתובת אימייל וסיסמה לבדיקה בהתחברות משתמש למערכת
        public List<UserNewDTO> logIn(string userEmail, string userPassword)
        {
            swishDBContext db = new swishDBContext();
            var user = db.S_User_New.Where(y => y.email == userEmail && y.password == userPassword).Select(x => new UserNewDTO()
            {
                id = x.id,
                firstName = x.firstName,
                lastName = x.lastName,
                email = x.email,
                password = x.password,
                profilePicture = x.profilePicture,
                phoneNumber = x.phoneNumber,
                residence = x.residence,
                radius = x.radius,
                birthDate = x.birthDate,
                avatarlevel = (int)x.avatarlevel,
                numOfPoints = (int)x.numOfPoints,
                showItemsFeed = x.showItemsFeed,
                numOfItems = x.S_User_Items.Where(u => u.itemStatus == "available").Count(),
                userToken = x.userToken
            }).ToList();

            return user;
        }

        [HttpGet]
        [Route("api/UserNew/GetUserItemsListDistance/{userEmail}/{userLongi}/{userLati}/")] //הבאת כתובת אימייל וסיסמה לבדיקה בהתחברות משתמש למערכת
        public List<UserItemsDTO> GetUserItemsListDistance(string userEmail, double userLongi, double userLati)
        {
            swishDBContext db = new swishDBContext();
            List<UserItemsDTO> items = UsersListGet(userEmail);
            List<UserItemsDTO> finalItems = new List<UserItemsDTO>();
            double lat2;
            double lon2;

            foreach (var item in items)
            {
                double lat1 = userLati;
                double lon1 = userLongi;

                if (item.itemsListDTO[0].latitude == null || item.itemsListDTO[0].longitude == null)
                {
                    lat2 = 0;
                    lon2 = 0;
                }
                else
                {
                    lat2 = (double)item.itemsListDTO[0].latitude;
                    lon2 = (double)item.itemsListDTO[0].longitude;
                }

                var userRadius = GetUser(userEmail);
                var R = 6376.5000; //Km
                var rad = Math.PI / 180.0;

                lat1 = lat1 * (rad);
                lat2 = lat2 * (rad);
                lon1 = lon1 * (rad);
                lon2 = lon2 * (rad);
                var dLat = lat2 - lat1;
                var dLon = lon2 - lon1;
                var a = Math.Pow(Math.Sin(dLat / 2), 2) + (Math.Pow(Math.Sin(dLon / 2), 2) * Math.Cos(lat1) * Math.Cos(lat2));
                var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
                var distance = R * c;

                if (distance <= userRadius[0].radius)
                {
                    item.itemsListDTO[0].distance = distance;
                    finalItems.Add(item);

                    if (finalItems != null)
                    {
                        finalItems.Sort((x, y) => x.itemsListDTO[0].distance.CompareTo(y.itemsListDTO[0].distance));

                        var date = DateTime.Now - item.uploadDate;
                        if (date.Value.Days >= 10)
                        {
                            finalItems.Sort((x, y) => DateTime.Compare((DateTime)x.uploadDate, (DateTime)y.uploadDate));
                        }
                    }
                }
            }
            return finalItems;
        }


        [HttpGet]
        [Route("api/UserNew/GetForSmartApp/{userEmail}/{userLongi}/{userLati}/{showItemsFeed}")]
        public List<UserItemsDTO> GetForSmartApp(string userEmail, double userLongi, double userLati, string showItemsFeed)
        {
            swishDBContext db = new swishDBContext();
            List<UserItemsDTO> items = UsersListGet(userEmail);
            UserFilterController f = new UserFilterController();
            List<UserFilterDTO> filter = f.GetFilters();
            var keyWord = "";
            var keyWordType = "";
            List<UserItemsDTO> startArray = new List<UserItemsDTO>();
            List<UserItemsDTO> filterItems = new List<UserItemsDTO>();

            FavoriteUsersController fa = new FavoriteUsersController();
            List<UserItemsDTO> favorite = fa.FavoriteItemUsersGet(userEmail);

            double lat2;
            double lon2;

            foreach (var item in items)
            {
                double lat1 = userLati;
                double lon1 = userLongi;

                if (item.itemsListDTO[0].latitude == null || item.itemsListDTO[0].longitude == null)
                {
                    lat2 = 0;
                    lon2 = 0;
                }
                else
                {
                    lat2 = (double)item.itemsListDTO[0].latitude;
                    lon2 = (double)item.itemsListDTO[0].longitude;
                }

                var userRadius = GetUser(userEmail);
                var R = 6376.5000; //Km
                var rad = Math.PI / 180.0;

                lat1 = lat1 * (rad);
                lat2 = lat2 * (rad);
                lon1 = lon1 * (rad);
                lon2 = lon2 * (rad);
                var dLat = lat2 - lat1;
                var dLon = lon2 - lon1;
                var a = Math.Pow(Math.Sin(dLat / 2), 2) + (Math.Pow(Math.Sin(dLon / 2), 2) * Math.Cos(lat1) * Math.Cos(lat2));
                var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
                var distance = R * c;

                if (distance <= userRadius[0].radius)
                {
                    item.itemsListDTO[0].distance = distance;
                    startArray.Add(item);
                }
            }

            if (showItemsFeed == "S")
            {
                foreach (var i in startArray)
                {
                    foreach (var fil in filter)
                    {
                        if (fil.email == userEmail)
                        {
                            keyWord = fil.keyWord;
                            keyWordType = fil.keyWordType;
                            //var date = DateTime.Now - i.uploadDate;

                            if (keyWordType == "type" && keyWord == i.itemsListDTO[0].priceList[0].name)
                            {
                                filterItems.Add(i);
                            }
                            if (keyWordType == "style" && keyWord == i.itemsListDTO[0].styleList[0].style)
                            {
                                filterItems.Add(i);
                            }
                            if (keyWordType == "size" && keyWord == i.itemsListDTO[0].sizeList[0].size)
                            {
                                filterItems.Add(i);
                            }
                            if (keyWordType == "condition" && keyWord == i.itemsListDTO[0].conditionList[0].condition)
                            {
                                filterItems.Add(i);
                            }
                        }
                    }
                    filterItems.Sort((x, y) => DateTime.Compare((DateTime)x.uploadDate, (DateTime)y.uploadDate));
                }

                filterItems.Reverse();
                startArray.Sort((x, y) => DateTime.Compare((DateTime)x.uploadDate, (DateTime)y.uploadDate));
                startArray.Reverse();
                foreach (var y in startArray)
                {
                    if (filterItems.Contains(y))
                    {
                        continue;
                    }
                    else
                    {
                        filterItems.Add(y);
                    }
                }
            }
            if (showItemsFeed == "F")
            {
                filterItems = favorite;
                filterItems.Sort((x, y) => DateTime.Compare((DateTime)x.uploadDate, (DateTime)y.uploadDate));
                filterItems.Reverse();
                startArray.Sort((x, y) => DateTime.Compare((DateTime)x.uploadDate, (DateTime)y.uploadDate));
                startArray.Reverse();

                List<UserItemsDTO> tempList = new List<UserItemsDTO>(startArray);
                foreach (UserItemsDTO ff in filterItems)
                {
                    int fId = ff.itemId;
                    foreach (UserItemsDTO i in tempList)
                    {
                        int iId = i.itemId;
                        if (iId == fId)
                        {
                            startArray.Remove(i);
                        }
                    }
                }
                foreach (var item in startArray)
                {
                    filterItems.Add(item);
                }
                
            }
            return filterItems;
        }

        [HttpGet]
        [Route("api/UserNew/UsersListGet/{userEmail}/")]
        public List<UserItemsDTO> UsersListGet(string userEmail) //לשימוש בFEED
        {
            swishDBContext db = new swishDBContext();

            var UserItemsList = db.S_User_Items.Where(e => e.email != userEmail && e.itemStatus == "available").Select(y => new UserItemsDTO()
            {
                id = y.id,
                itemId = (int)y.itemId,
                email = y.email,
                status = y.itemStatus,
                userListDTO = db.S_User_New.Where(u => u.email == y.email).Select(x => new UserNewDTO()
                {
                    id = x.id,
                    firstName = x.firstName,
                    lastName = x.lastName,
                    email = x.email,
                    profilePicture = x.profilePicture,
                    residence = x.residence,
                    radius = x.radius,
                    numOfItems = x.S_User_Items.Count(),
                    numOfPoints = x.numOfPoints,
                    showItemsFeed = x.showItemsFeed,
                    avatarlevel = (int)x.avatarlevel,
                    userToken = x.userToken,
                }).ToList(),
                uploadDate = y.uploadDate,
                itemsListDTO = db.S_Item_New.Where(i => i.itemId == y.itemId).Select(it => new ItemNewDTO()
                {
                    itemId = it.itemId,
                    image1 = it.image1,
                    image2 = it.image2,
                    image3 = it.image3,
                    image4 = it.image4,
                    name = it.name,
                    numberOfPoints = (int)it.numberOfPoints,
                    description = it.description,
                    conditionId = (int)it.conditionId,
                    latitude = it.latitude,
                    longitude = it.longitude,
                    distance = 0,
                    conditionList = db.S_ConditionPrices.Where(p => p.id == it.conditionId).Select(n => new ConditionPricesDTO()
                    {
                        id = n.id,
                        condition = n.condition,
                        reduction = (int)n.reduction
                    }).ToList(),
                    styleId = (int)it.styleId,
                    styleList = db.S_ItemStyle.Where(s => s.id == it.styleId).Select(q => new ItemStyleDTO()
                    {
                        id = q.id,
                        style = q.style
                    }).ToList(),
                    sizeId = (int)it.sizeId,
                    sizeList = db.S_ItemSize.Where(l => l.id == it.sizeId).Select(w => new ItemSizeDTO()
                    {
                        id = w.id,
                        size = w.size
                    }).ToList(),
                    typeId = (int)it.typeId,
                    priceList = db.S_ItemPrice.Where(p => p.id == it.typeId).Select(e => new ItemPriceDTO()
                    {
                        id = (int)it.typeId,
                        name = e.name,
                        price = (int)e.price
                    }).ToList(),
                }).ToList()
            }).ToList();

            return UserItemsList;
        }

        [HttpGet]
        [Route("api/UserNew/GetUser/{userEmail}/")]
        public List<UserNewDTO> GetUser(string userEmail)
        {
            swishDBContext db = new swishDBContext();

            var user = db.S_User_New.Where(y => y.email == userEmail).Select(x => new UserNewDTO()
            {
                id = x.id,
                firstName = x.firstName,
                lastName = x.lastName,
                email = x.email,
                password = x.password,
                profilePicture = x.profilePicture,
                phoneNumber = x.phoneNumber,
                residence = x.residence,
                radius = x.radius,
                birthDate = x.birthDate,
                avatarlevel = (int)x.avatarlevel,
                numOfPoints = (int)x.numOfPoints,
                numOfItems = x.S_User_Items.Count,
                userToken = x.userToken,
                showItemsFeed = x.showItemsFeed,

                UserItemsListDTO = db.S_User_Items.Where(e => e.email == userEmail && e.itemStatus == "available").Select(y => new UserItemsDTO()
                {
                    id = y.id,
                    itemId = (int)y.itemId,
                    email = y.email,
                    uploadDate = y.uploadDate,
                    status = y.itemStatus,
                    itemsListDTO = db.S_Item_New.Where(i => i.itemId == y.itemId).Select(it => new ItemNewDTO()
                    {
                        itemId = it.itemId,
                        image1 = it.image1,
                        image2 = it.image2,
                        image3 = it.image3,
                        image4 = it.image4,
                        name = it.name,
                        description = it.description,
                        conditionId = (int)it.conditionId,
                        conditionList = db.S_ConditionPrices.Where(p => p.id == it.conditionId).Select(n => new ConditionPricesDTO()
                        {
                            id = n.id,
                            condition = n.condition,
                            reduction = (int)n.reduction
                        }).ToList(),
                        styleId = (int)it.styleId,
                        styleList = db.S_ItemStyle.Where(s => s.id == it.styleId).Select(q => new ItemStyleDTO()
                        {
                            id = q.id,
                            style = q.style
                        }).ToList(),
                        sizeId = (int)it.sizeId,
                        sizeList = db.S_ItemSize.Where(l => l.id == it.sizeId).Select(w => new ItemSizeDTO()
                        {
                            id = w.id,
                            size = w.size
                        }).ToList(),
                        typeId = (int)it.typeId,
                        priceList = db.S_ItemPrice.Where(p => p.id == it.typeId).Select(e => new ItemPriceDTO()
                        {
                            id = (int)it.typeId,
                            name = e.name,
                            price = (int)e.price
                        }).ToList(),
                        numberOfPoints = (int)it.numberOfPoints
                    }).ToList()
                }).ToList()
            }).ToList();

            user[0].UserItemsListDTO.Sort((x, y) => DateTime.Compare((DateTime)x.uploadDate, (DateTime)y.uploadDate));
            user[0].UserItemsListDTO.Reverse();

            return user;
        }


        // POST api/<controller>
        public HttpResponseMessage Post(UserNewDTO userDTO) //הכנסת משתמש חדש לDB
        {
            swishDBContext db = new swishDBContext();
            S_User_New user = new S_User_New();

            var Suser = db.S_User_New.SingleOrDefault(x => x.email == userDTO.email);
            if (Suser != null)
            {
                return Request.CreateResponse(HttpStatusCode.NotImplemented, "שם המשתמש קיים במערכת");
            }
            else
            {
                user.id = userDTO.id;
                user.firstName = userDTO.firstName;
                user.lastName = userDTO.lastName;
                user.phoneNumber = userDTO.phoneNumber;
                user.email = userDTO.email;
                user.password = userDTO.password;
                if (userDTO.profilePicture == "")
                {
                    user.profilePicture = $"http://proj.ruppin.ac.il/bgroup17/prod/uploadImages/logo.jpg";
                }
                else
                {
                    user.profilePicture = userDTO.profilePicture;
                }
                user.residence = userDTO.residence;
                user.radius = userDTO.radius;
                user.birthDate = userDTO.birthDate;
                user.dailySentenceId = 1;
                user.avatarlevel = 1;
                user.numOfPoints = 50;
                user.showItemsFeed = "S";

                try
                {
                    db.S_User_New.Add(user);
                    db.SaveChanges();

                }
                catch (DbUpdateConcurrencyException ex) //שגיאה בדריסת ערך של שמירה מקבילית
                {
                    return Request.CreateResponse(HttpStatusCode.Conflict, "נא לנסות שוב");
                }

                catch (Exception ex) //שגיאה כללית
                {
                    return Request.CreateResponse(HttpStatusCode.NotImplemented, ex.Message);
                }
                return Request.CreateResponse(HttpStatusCode.OK, "משתמש נוסף בהצלחה");
            }
        }

        // PUT api/<controller>/5
        [HttpPut]
        [Route("api/UserNew/PutAddPointsUser/{userEmail}/{numOfPoints}")]
        public IHttpActionResult PutAddPointsUser(string userEmail, int numOfPoints)
        {
            try
            {
                swishDBContext db = new swishDBContext();
                S_User_New u = db.S_User_New.SingleOrDefault(x => x.email == userEmail);

                if (u != null)
                {
                    u.numOfPoints += numOfPoints;
                    db.SaveChanges();
                    return Ok(u);
                }
                return Content(HttpStatusCode.NotFound, "לא נמצא משתמש עם מאמייל זה");
            }
            catch (Exception ex)
            {

                return BadRequest(ex.Message);
            }
        }

        // PUT api/<controller>/5
        [HttpPut]
        [Route("api/UserNew/PutRemovePointsUser/{userEmail}/{numOfPoints}")]
        public IHttpActionResult PutRemovePointsUser(int numOfPoints, string userEmail)
        {
            try
            {
                swishDBContext db = new swishDBContext();
                S_User_New u = db.S_User_New.SingleOrDefault(x => x.email == userEmail);

                if (u != null)
                {
                    u.numOfPoints -= numOfPoints;
                    db.SaveChanges();
                    return Ok(u);
                }
                return Content(HttpStatusCode.NotFound, "לא נמצא משתמש עם מאמייל זה");
            }
            catch (Exception ex)
            {

                return BadRequest(ex.Message);
            }
        }

        [HttpPut]
        [Route("api/UserNew/RemoveLevelAvPut/{userEmail}/")]
        public IHttpActionResult RemoveLevelAvPut(string userEmail)
        {
            try
            {
                swishDBContext db = new swishDBContext();
                S_User_New user = db.S_User_New.SingleOrDefault(x => x.email == userEmail);
                if (user != null)
                {
                    if (2 <= user.avatarlevel)
                    {
                        user.avatarlevel -= 1;
                        db.SaveChanges();
                        return Ok(user);
                    }
                    else
                    {
                        user.avatarlevel = 1;
                        db.SaveChanges();
                        return Ok(user);
                    }
                }
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
            return Content(HttpStatusCode.OK, "עודכן");
        }

        [HttpPut]
        [Route("api/UserNew/AvatarPut/{userEmail}/")]
        // PUT api/<controller>/5
        public IHttpActionResult AvatarPut(string userEmail)
        {
            try
            {
                swishDBContext db = new swishDBContext();
                S_User_New user = db.S_User_New.SingleOrDefault(x => x.email == userEmail);
                if (user != null)
                {

                    if (user.avatarlevel <= 4)
                    {
                        user.avatarlevel += 1;
                        db.SaveChanges();
                    }
                    else
                    {
                        user.avatarlevel = 1;
                        db.SaveChanges();

                        UserNewController u = new UserNewController();
                        u.PutAddPointsUser(userEmail, 30);
                        return Ok(user);
                    }
                }
            }
            catch (Exception ex)
            {

                return BadRequest(ex.Message);
            }
            return Content(HttpStatusCode.OK, "עודכן");
        }

        [HttpPut]
        [Route("api/UserNew/PutUserSettings/{userEmail}/")]
        // PUT api/<controller>/5
        public List<UserNewDTO> PutUserSettings(string userEmail, UserNewDTO userDTO)
        {
            try
            {
                swishDBContext db = new swishDBContext();
                S_User_New user = db.S_User_New.SingleOrDefault(x => x.email == userEmail);
                if (user != null)
                {
                    if (userDTO.firstName != "")
                    {
                        user.firstName = userDTO.firstName;
                    }
                    if (userDTO.lastName != "")
                    {
                        user.lastName = userDTO.lastName;
                    }

                    user.radius = userDTO.radius;
                    user.residence = userDTO.residence;
                    user.password = userDTO.password;
                    user.showItemsFeed = userDTO.showItemsFeed;
                    if (userDTO.profilePicture != "")
                    {
                        user.profilePicture = userDTO.profilePicture;
                    }
                    db.SaveChanges();

                    UserNewController u = new UserNewController();
                    List<UserNewDTO> us= u.GetUser(userEmail);
                    return us;

                }
            }
            catch (Exception ex)
            {
                return null;
            }
            return null;
        }

        [HttpPut]
        [Route("api/UserNew/PutUserToken/{userEmail}/{token}/")]
        // PUT api/<controller>/5
        public string PutUserToken(string userEmail, string token)
        {
            try
            {
                swishDBContext db = new swishDBContext();
                S_User_New user = db.S_User_New.SingleOrDefault(x => x.email == userEmail);
                if (user != null)
                {
                    user.userToken = token;

                    db.SaveChanges();
                    return "user token changed";
                }
            }
            catch (Exception ex)
            {
                return null;
            }
            return null;
        }

    }
}