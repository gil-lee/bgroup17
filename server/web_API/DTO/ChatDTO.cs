using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace web_API.DTO
{
    public class ChatDTO
    {
        public int id;
        public int uploadUser;
        public int requestUser;
        public int itemId;
        public DateTime? lastMessageDate;
        public DateTime? openChatDate;
        public string chatStatus;
        public bool uploadConfirm;
        public bool requestConfirm;
        public List<UserNewDTO> userDTO;
        public List<UserNewDTO> userUploadToken;
        public List<UserNewDTO> userRequestToken;

    }
}