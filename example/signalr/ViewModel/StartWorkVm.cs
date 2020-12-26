using Example.Enums;
using System;
using System.ComponentModel.DataAnnotations;

namespace Example.ViewModel
{
    public class StartWorkVm
    {

        [Required]
        public JobType JobType { get; set; }

        [Required, MaxLength(100)]
        public string FirstName { get; set; }

        [Required, MaxLength(200)]
        public string LastName { get; set; }

        public DateTime BirthDate { get; set; }

    }
}
