using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace web_API.DTO
{
    public class UserFilterDTO
    {
        public int id;
        public string email;
        public string keyWordType;
        public string keyWord;
        public List<UserNewDTO> userToken;
    }
}