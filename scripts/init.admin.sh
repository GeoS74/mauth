#!/bin/bash

# Функция для проверки валидности email
validate_email() {
  local email_regex="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
  [[ "$1" =~ $email_regex ]] && return 0 || return 1
}

# Запрашиваем email у пользователя
while true; do
  read -p "Введите email: " user_email
  
  # Проверка на пустоту
  if [ -z "$user_email" ]; then
    echo "Ошибка: Email не может быть пустым!"
    continue
  fi
  
  # Проверка валидности email
  if ! validate_email "$user_email"; then
    echo "Ошибка: Некорректный формат email! Пример: user@example.com"
    continue
  fi
  
  break
done

# Имя Docker-контейнера (замените на ваше)
CONTAINER_NAME="your_container_name"

# Проверяем, запущен ли контейнер
# if ! docker ps | grep -q $CONTAINER_NAME; then
#   echo "Ошибка: Контейнер $CONTAINER_NAME не запущен!"
#   exit 1
# fi

# Выполняем команду в контейнере
echo "Выполняю: npm run initAdmin --email $user_email"
npm run initAdmin $user_email
# docker exec -it $CONTAINER_NAME npm run initAdmin --email "$user_email"

echo "Команда успешно выполнена с email: $user_email"