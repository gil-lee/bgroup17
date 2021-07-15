using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace web_API.DTO
{
    public class ItemNewDTO
    {
        public int itemId;
        public string name;
        public string description;
        public string image1;
        public string image2;
        public string image3;
        public string image4;
        public int numberOfPoints;
        public int sizeId;
        public int typeId;
        public int styleId;
        public int conditionId;

        public double distance; 
        public double? latitude;
        public double? longitude;

        public List<ConditionPricesDTO> conditionList;
        public List<ItemStyleDTO> styleList;
        public List<ItemSizeDTO> sizeList;
        public List<ItemPriceDTO> priceList;
    }
}