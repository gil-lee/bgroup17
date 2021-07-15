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
    public class ChatController : ApiController
    {
        // GET api/<controller>
        [HttpGet]
        [Route("api/Chat/GetChatList/{userId}")]
        public IEnumerable<ChatDTO> GetChatList(int userId)
        {
            swishDBContext db = new swishDBContext();
            var chats = db.S_Chat.Where(y => y.uploadUser == userId || y.requestUser == userId).Select(x => new ChatDTO()
            {
                id = x.id,
                itemId = (int)x.itemId,
                uploadUser = x.uploadUser,
                requestUser = x.requestUser,
                lastMessageDate = x.lastMessageDate,
                chatStatus = x.chatStatus,
                uploadConfirm = (bool)x.uploadConfirm,
                requestConfirm = (bool)x.requestConfirm
            }).ToList();

            return chats;
        }

        [HttpGet]
        [Route("api/Chat/GetChatListForReminder")]
        public string[] GetChatListForReminder()
        {
            swishDBContext db = new swishDBContext();
            List<ChatDTO> chatsForReminder = new List<ChatDTO>();


            var chats = db.S_Chat.Where(y => y.chatStatus == "available" || y.chatStatus == "waiting").Select(x => new ChatDTO()
            {
                id = x.id,
                itemId = (int)x.itemId,
                uploadUser = x.uploadUser,
                requestUser = x.requestUser,
                lastMessageDate = x.lastMessageDate,
                openChatDate = x.openChatDate,
                chatStatus = x.chatStatus,
                uploadConfirm = (bool)x.uploadConfirm,
                requestConfirm = (bool)x.requestConfirm,
                userRequestToken = db.S_User_New.Where(z => z.id == x.requestUser && x.requestConfirm == false).Select(u => new UserNewDTO()
                {
                    userToken = u.userToken
                }).ToList(),
                userUploadToken = db.S_User_New.Where(z => z.id == x.uploadUser && x.uploadConfirm == false).Select(u => new UserNewDTO()
                {
                    userToken = u.userToken
                }).ToList()
            }).ToList();

            foreach (var item in chats)
            {
                var date = DateTime.Now - item.openChatDate;
                if (date.Value.Days >= 3 && (item.uploadConfirm == false || item.requestConfirm == false))
                {
                    chatsForReminder.Add(item);
                }
            }
            var counter = 0;
            var num = chatsForReminder.Count();
            string[] tokens = new string[num * 2];
            foreach (var item in chatsForReminder)
            {
                if (item.userRequestToken.Count > 0)
                {
                    tokens[counter++] = item.userRequestToken[0].userToken;
                }
                if (item.userUploadToken.Count > 0)
                {
                    tokens[counter++] = item.userUploadToken[0].userToken;
                }
            }
            string[] tokens2 = new string[tokens.Length];
            int numDups = 0, prevIndex = 0;

            for (int i = 0; i < tokens.Length; i++)
            {
                bool foundToken = false;
                for (int j = 0; j < i; j++)
                {
                    if (tokens[i] == tokens[j])
                    {
                        foundToken = true;
                        numDups++;
                        break;
                    }
                }
                if (foundToken == false)
                {
                    tokens2[prevIndex] = tokens[i];
                    prevIndex++;
                }
            }

            return tokens2;
        }

        [HttpGet]
        [Route("api/Chat/GetChatListUp/{userId}")]
        public List<ChatDTO> GetChatListUp(int userId)
        {
            swishDBContext db = new swishDBContext();
            var chats = db.S_Chat.Where(y => y.uploadUser == userId && (y.chatStatus == "available" || y.chatStatus == "waiting")).Select(z => new ChatDTO()
            {
                id = z.id,
                itemId = (int)z.itemId,
                requestUser = z.requestUser,
                uploadUser = z.uploadUser,
                lastMessageDate = z.lastMessageDate,
                chatStatus = z.chatStatus,
                uploadConfirm = (bool)z.uploadConfirm,
                requestConfirm = (bool)z.requestConfirm,
                userDTO = db.S_User_New.Where(u => u.id == z.requestUser).Select(x => new UserNewDTO()
                {
                    id = x.id,
                    firstName = x.firstName,
                    lastName = x.lastName,
                    email = x.email,
                    profilePicture = x.profilePicture,
                    userToken = x.userToken,
                    UserItemsListDTO = db.S_User_Items.Where(e => (e.itemStatus == "available" || e.itemStatus == "waiting") && e.itemId == z.itemId).Select(y => new UserItemsDTO()
                    {
                        itemsListDTO = db.S_Item_New.Where(i => i.itemId == z.itemId).Select(it => new ItemNewDTO()
                        {
                            itemId = it.itemId,
                            image1 = it.image1,
                            image2 = it.image2,
                            image3 = it.image3,
                            image4 = it.image4,
                            name = it.name,
                            numberOfPoints = (int)it.numberOfPoints,
                            description = it.description
                        }).ToList(),
                    }).ToList(),
                }).ToList(),
            }).ToList();

            chats.Sort((x, y) => DateTime.Compare((DateTime)x.lastMessageDate, (DateTime)y.lastMessageDate));
            chats.Reverse();

            return chats;
        }

        [HttpGet]
        [Route("api/Chat/GetChatDecDelUp/{userId}")]
        public List<ChatDTO> GetChatDecDelUp(int userId)
        {
            swishDBContext db = new swishDBContext();
            var chats = db.S_Chat.Where(y => y.uploadUser == userId && (y.chatStatus == "declined" || y.chatStatus == "delivered")).Select(z => new ChatDTO()
            {
                id = z.id,
                itemId = (int)z.itemId,
                requestUser = z.requestUser,
                uploadUser = z.uploadUser,
                lastMessageDate = z.lastMessageDate,
                chatStatus = z.chatStatus,
                uploadConfirm = (bool)z.uploadConfirm,
                requestConfirm = (bool)z.requestConfirm,
                userDTO = db.S_User_New.Where(u => u.id == z.requestUser).Select(x => new UserNewDTO()
                {
                    id = x.id,
                    firstName = x.firstName,
                    lastName = x.lastName,
                    email = x.email,
                    profilePicture = x.profilePicture,
                    userToken = x.userToken,
                    UserItemsListDTO = db.S_User_Items.Where(e => e.email == x.email && e.itemStatus == "declined" || e.itemStatus == "delivered").Select(y => new UserItemsDTO()
                    {
                        itemsListDTO = db.S_Item_New.Where(i => i.itemId == z.itemId).Select(it => new ItemNewDTO()
                        {
                            itemId = it.itemId,
                            image1 = it.image1,
                            image2 = it.image2,
                            image3 = it.image3,
                            image4 = it.image4,
                            name = it.name,
                            numberOfPoints = (int)it.numberOfPoints,
                            description = it.description
                        }).ToList(),
                    }).ToList(),
                }).ToList(),
            }).ToList();


            chats.Sort((x, y) => DateTime.Compare((DateTime)x.lastMessageDate, (DateTime)y.lastMessageDate));
            chats.Reverse();

            return chats;
        }

        [HttpGet]
        [Route("api/Chat/GetChatListRe/{userId}")]
        public List<ChatDTO> GetChatListRe(int userId)
        {
            swishDBContext db = new swishDBContext();
            var chats = db.S_Chat.Where(y => y.requestUser == userId && (y.chatStatus == "available" || y.chatStatus == "waiting")).Select(z => new ChatDTO()
            {
                id = z.id,
                itemId = (int)z.itemId,
                uploadUser = z.uploadUser,
                requestUser = z.requestUser,
                lastMessageDate = z.lastMessageDate,
                chatStatus = z.chatStatus,
                uploadConfirm = (bool)z.uploadConfirm,
                requestConfirm = (bool)z.requestConfirm,
                userDTO = db.S_User_New.Where(u => u.id == z.uploadUser).Select(x => new UserNewDTO()
                {
                    id = x.id,
                    firstName = x.firstName,
                    lastName = x.lastName,
                    email = x.email,
                    profilePicture = x.profilePicture,
                    userToken = x.userToken,
                    UserItemsListDTO = db.S_User_Items.Where(e => e.email == x.email && (e.itemStatus == "available" || e.itemStatus == "waiting") && e.itemId == z.itemId).Select(k => new UserItemsDTO()
                    {
                        status = k.itemStatus,
                        itemsListDTO = db.S_Item_New.Where(i => i.itemId == z.itemId).Select(it => new ItemNewDTO()
                        {
                            itemId = it.itemId,
                            image1 = it.image1,
                            image2 = it.image2,
                            image3 = it.image3,
                            image4 = it.image4,
                            name = it.name,
                            numberOfPoints = (int)it.numberOfPoints,
                            description = it.description,
                        }).ToList(),
                    }).ToList(),
                }).ToList(),
            }).ToList();


            chats.Sort((x, y) => DateTime.Compare((DateTime)x.lastMessageDate, (DateTime)y.lastMessageDate));
            chats.Reverse();

            return chats;
        }

        [HttpGet]
        [Route("api/Chat/GetChatDecDelRe/{userId}")]
        public List<ChatDTO> GetChatDecDelRe(int userId)
        {
            swishDBContext db = new swishDBContext();
            var chats = db.S_Chat.Where(y => y.requestUser == userId && (y.chatStatus == "declined" || y.chatStatus == "delivered")).Select(z => new ChatDTO()
            {
                id = z.id,
                itemId = (int)z.itemId,
                uploadUser = z.uploadUser,
                lastMessageDate = z.lastMessageDate,
                chatStatus = z.chatStatus,
                uploadConfirm = (bool)z.uploadConfirm,
                requestConfirm = (bool)z.requestConfirm,
                userDTO = db.S_User_New.Where(u => u.id == z.uploadUser).Select(x => new UserNewDTO()
                {
                    id = x.id,
                    firstName = x.firstName,
                    lastName = x.lastName,
                    email = x.email,
                    profilePicture = x.profilePicture,
                    userToken = x.userToken,
                    UserItemsListDTO = db.S_User_Items.Where(e => e.email == x.email && (e.itemStatus == "available" || e.itemStatus == "delivered") && e.itemId == z.itemId).Select(k => new UserItemsDTO()
                    {
                        status = k.itemStatus,
                        itemsListDTO = db.S_Item_New.Where(i => i.itemId == z.itemId).Select(it => new ItemNewDTO()
                        {
                            itemId = it.itemId,
                            image1 = it.image1,
                            image2 = it.image2,
                            image3 = it.image3,
                            image4 = it.image4,
                            name = it.name,
                            numberOfPoints = (int)it.numberOfPoints,
                            description = it.description,
                        }).ToList(),
                    }).ToList(),
                }).ToList(),
            }).ToList();

            chats.Sort((x, y) => DateTime.Compare((DateTime)x.lastMessageDate, (DateTime)y.lastMessageDate));
            chats.Reverse();

            return chats;
        }

        [HttpGet]
        [Route("api/Chat/GetAllChats/{userId}")]
        public IEnumerable<ChatDTO> GetAllChats(int userId)
        {
            List<ChatDTO> chatListRe = GetChatListRe(userId);
            List<ChatDTO> chatListUp = GetChatListUp(userId);

            List<ChatDTO> allChats = new List<ChatDTO>();
            foreach (var chat in chatListRe)
            {
                allChats.Add(chat);
            }
            foreach (var chat in chatListUp)
            {
                allChats.Add(chat);
            }

            allChats.Sort((x, y) => DateTime.Compare((DateTime)x.lastMessageDate, (DateTime)y.lastMessageDate));
            allChats.Reverse();
            return allChats;
        }

        [HttpGet]
        [Route("api/Chat/GetChatsDecDel/{userId}")]
        public IEnumerable<ChatDTO> GetChatsDecDel(int userId)
        {
            List<ChatDTO> chatListRe = GetChatDecDelRe(userId);
            List<ChatDTO> chatListUp = GetChatDecDelUp(userId);

            List<ChatDTO> allChats = new List<ChatDTO>();
            foreach (var chat in chatListRe)
            {
                allChats.Add(chat);
            }
            foreach (var chat in chatListUp)
            {
                allChats.Add(chat);
            }
            allChats.Sort((x, y) => DateTime.Compare((DateTime)x.lastMessageDate, (DateTime)y.lastMessageDate));
            allChats.Reverse();

            return allChats;
        }

        [HttpGet]
        [Route("api/Chat/GetChats/{userId}")]
        public IEnumerable<ChatDTO> GetChats(int userId)
        {
            IEnumerable<ChatDTO> chatAvaiWaiti = GetAllChats(userId);
            IEnumerable<ChatDTO> chatDecDel = GetChatsDecDel(userId);

            List<ChatDTO> allChats = new List<ChatDTO>();
            foreach (var chat in chatAvaiWaiti)
            {
                allChats.Add(chat);
            }
            foreach (var chat in chatDecDel)
            {
                allChats.Add(chat);
            }
            return allChats;
        }

        [HttpGet]
        [Route("api/Chat/GetChatDetails/{userId}/{userId2}/{itemId}")]
        public List<ChatDTO> GetChatDetails(int userId, int userId2, int itemId)
        {
            swishDBContext db = new swishDBContext();
            var chats = db.S_Chat.Where(
                y =>
               (y.itemId == itemId && y.requestUser == userId2 && y.uploadUser == userId) ||
               (y.itemId == itemId && y.requestUser == userId && y.uploadUser == userId2)).Select(z => new ChatDTO()
               {
                   id = z.id,
                   itemId = (int)z.itemId,
                   uploadUser = z.uploadUser,
                   requestUser = z.requestUser,
                   lastMessageDate = z.lastMessageDate,
                   chatStatus = z.chatStatus,
                   uploadConfirm = (bool)z.uploadConfirm,
                   requestConfirm = (bool)z.requestConfirm,
                   userDTO = db.S_User_New.Where(u => u.id == z.uploadUser).Select(x => new UserNewDTO()
                   {
                       UserItemsListDTO = db.S_User_Items.Where(
                           e => e.email == x.email && e.itemStatus == "available" && e.itemId == z.itemId).Select(k => new UserItemsDTO()
                           {
                               id = k.id,
                               itemId = (int)k.itemId,
                               uploadDate = k.uploadDate,
                               status = k.itemStatus,
                           }).ToList(),
                   }).ToList(),
               }).ToList();

            return chats;
        }



        // POST api/<controller>
        [HttpPost]
        [Route("api/Chat/PostChat")]
        public HttpResponseMessage PostChat(ChatDTO chatDTO) //הכנסת משתמש חדש לDB
        {
            swishDBContext db = new swishDBContext();
            S_Chat c = new S_Chat();

            var chat = db.S_Chat.SingleOrDefault(x => x.uploadUser == chatDTO.uploadUser && x.requestUser == chatDTO.requestUser && x.itemId == chatDTO.itemId);
            if (chat != null)
            {
                return Request.CreateResponse(HttpStatusCode.NotImplemented, "קיים צ'אט במערכת");
            }
            else
            {
                c.uploadUser = chatDTO.uploadUser;
                c.requestUser = chatDTO.requestUser;
                c.itemId = chatDTO.itemId;
                c.lastMessageDate = chatDTO.lastMessageDate;
                c.openChatDate = chatDTO.openChatDate;
                c.chatStatus = "waiting";
                c.uploadConfirm = false;
                c.requestConfirm = false;

                try
                {
                    db.S_Chat.Add(c);
                    db.SaveChanges();

                }
                catch (Exception ex) //שגיאה כללית
                {
                    return Request.CreateResponse(HttpStatusCode.NotImplemented, ex.Message);
                }
                return Request.CreateResponse(HttpStatusCode.OK, "שורת הצ'אט התווספה בהצלחה");
            }

        }


        // PUT api/<controller>/5
        [HttpPut]
        [Route("api/Chat/PutChatDate/{uploadUser}/{requestUser}/{itemId}")]
        public IHttpActionResult PutChatDate(int itemId, int uploadUser, int requestUser)
        {
            try
            {
                swishDBContext db = new swishDBContext();
                S_Chat c = db.S_Chat.SingleOrDefault(x => x.uploadUser == uploadUser && x.requestUser == requestUser && x.itemId == itemId && (x.chatStatus == "available" || x.chatStatus == "waiting"));
                var todayDate = DateTime.Now;
                if (c != null)
                {
                    c.lastMessageDate = todayDate;
                    db.SaveChanges();
                    return Ok(c);
                }
                return Content(HttpStatusCode.NotFound, "לא נמצא צ'אט כזה");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut]
        [Route("api/Chat/PutChatStatus")]
        public IHttpActionResult PutChatStatus(ChatDTO chatDTO)
        {
            try
            {
                swishDBContext db = new swishDBContext();
                S_Chat c = db.S_Chat.SingleOrDefault(x => x.uploadUser == chatDTO.uploadUser && x.requestUser == chatDTO.requestUser && x.itemId == chatDTO.itemId);

                if (c != null)
                {
                    c.chatStatus = chatDTO.chatStatus;
                    db.SaveChanges();
                }
                if (chatDTO.chatStatus == "delivered")
                {
                    UserItemsController userItems = new UserItemsController();
                    userItems.PutUserItemStatus(chatDTO.itemId, "delivered");
                }
                return Content(HttpStatusCode.NotFound, "לא נמצא צ'אט כזה");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut]
        [Route("api/Chat/PutUploadBtn")]
        public IHttpActionResult PutUploadBtn(ChatDTO chatDTO)
        {
            try
            {
                swishDBContext db = new swishDBContext();
                S_Chat c = db.S_Chat.SingleOrDefault(x => x.uploadUser == chatDTO.uploadUser && x.requestUser == chatDTO.requestUser && x.itemId == chatDTO.itemId);

                if (c != null)
                {
                    c.uploadConfirm = chatDTO.uploadConfirm;
                    db.SaveChanges();
                    return Content(HttpStatusCode.OK, "צ'אט עודכן");
                }
                else
                {
                    return Content(HttpStatusCode.NotFound, "לא נמצא צ'אט כזה");
                }

            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut]
        [Route("api/Chat/PutRequestBtn")]
        public List<UserNewDTO> PutRequestBtn(ChatDTO chatDTO)
        {
            try
            {
                swishDBContext db = new swishDBContext();
                ChatController chat = new ChatController();
                S_Chat c = db.S_Chat.SingleOrDefault(x => x.uploadUser == chatDTO.uploadUser && x.requestUser == chatDTO.requestUser && x.itemId == chatDTO.itemId);

                if (c != null)
                {
                    c.requestConfirm = chatDTO.requestConfirm;
                    c.chatStatus = "delivered";
                    //db.SaveChanges();

                    UserNewController user = new UserNewController();
                    var email = db.S_User_New.SingleOrDefault(y => y.id == chatDTO.uploadUser);
                    var reqemail = db.S_User_New.SingleOrDefault(u => u.id == chatDTO.requestUser);
                    var numOfPoints = db.S_Item_New.SingleOrDefault(i => i.itemId == chatDTO.itemId);
                    user.PutRemovePointsUser((int)numOfPoints.numberOfPoints, reqemail.email);
                    user.PutAddPointsUser(email.email, (int)numOfPoints.numberOfPoints);

                    List<ChatDTO> chatDTOs = new List<ChatDTO>();
                    chatDTOs = chat.GetChats(email.id).ToList();


                    foreach (var item in chatDTOs)
                    {
                        if (item.itemId == chatDTO.itemId && item.chatStatus != "delivered")
                        {
                            item.chatStatus = "declined";
                            chat.PutChatStatus(item);
                           // db.SaveChanges();
                        }
                    }

                    db.SaveChanges();
                    return user.GetUser(email.email);
                    //return Content(HttpStatusCode.OK, "צ'אט עודכן");
                }
                else
                {
                    //return Content(HttpStatusCode.NotFound, "לא נמצא צ'אט כזה");
                    return null;
                }
            }
            catch (Exception ex)
            {
                //return BadRequest(ex.Message);
                return null;
            }
        }
    }
}