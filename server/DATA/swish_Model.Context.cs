﻿//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace DATA
{
    using System;
    using System.Data.Entity;
    using System.Data.Entity.Infrastructure;
    
    public partial class swishDBContext : DbContext
    {
        public swishDBContext()
            : base("name=swishDBContext")
        {
        }
    
        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            throw new UnintentionalCodeFirstException();
        }
    
        public virtual DbSet<S_ConditionPrices> S_ConditionPrices { get; set; }
        public virtual DbSet<S_DailySentence> S_DailySentence { get; set; }
        public virtual DbSet<S_Item_New> S_Item_New { get; set; }
        public virtual DbSet<S_ItemPrice> S_ItemPrice { get; set; }
        public virtual DbSet<S_ItemSize> S_ItemSize { get; set; }
        public virtual DbSet<S_ItemStyle> S_ItemStyle { get; set; }
        public virtual DbSet<S_User_Items> S_User_Items { get; set; }
        public virtual DbSet<S_User_New> S_User_New { get; set; }
        public virtual DbSet<S_FavoriteUsers> S_FavoriteUsers { get; set; }
        public virtual DbSet<S_Chat> S_Chat { get; set; }
        public virtual DbSet<S_UserFilter> S_UserFilter { get; set; }
    }
}
