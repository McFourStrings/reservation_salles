<?php

namespace App\Enum;

enum UserRole: string
{
    case CLIENT = 'client';
    case ADMIN = 'admin';
}