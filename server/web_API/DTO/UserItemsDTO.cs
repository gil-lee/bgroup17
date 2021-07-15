using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace web_API.DTO
{
    public class UserItemsDTO
    {
        public int id;
        public string email;
        public int itemId;
        public DateTime? uploadDate;
        public string status; //available,deleted,delivered
        public List<ItemNewDTO> itemsListDTO;
        public List<UserNewDTO> userListDTO;
        public List<UserFilterDTO> UserFilterListDTO;
    }
}